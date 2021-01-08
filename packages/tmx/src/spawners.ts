import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameMapLayer } from './game-map';
import { Circle, Entity, Transform, World } from '@heliks/tiles-engine';
import {
  LayerType,
  TileProperties,
  Tileset,
  TmxLayer,
  TmxMap,
  TmxObjectLayer,
  TmxTileLayer
} from './parser';
import { ColliderShape, MaterialId, RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { Shape } from './parser/shape';
import { vec2, Vec2 } from '@heliks/tiles-math';

/**
 * Internal shape types that are recognized by the loader. Shapes with other types will
 * simply ignored and collected on the game map.
 */
export const enum ShapeType {
  /** Shapes that contain collision shapes (a.E. for invisible walls and stuff). */
  COLLISION = 'collision',
}

/** Properties that can possibly occur on a shape of type `ShapeType.COLLISION`. */
export interface CollisionShapeProperties {
  /**
   * If the shape is a collider that is part of a rigid-body this will be assigned
   * as it's `Material`
   */
  physicsMaterial?: MaterialId;
}

/** Tile iterator node. */
class TileNode implements Vec2 {

  /** @inheritDoc */
  public x = 0;

  /** @inheritDoc */
  public y = 0;

  /** Contains all shapes of the tile. */
  public get shapes(): Shape[] | undefined {
    return this.tileset.shapes.get(this.tileIdx);
  }

  constructor(
    public tileIdx: number,
    public tileset: Tileset
  ) {}

}

/** Utility class to iterate over all tiles in a tile layer. */
export class TileLayerIterator {

  /**
   * @param map The map asset that holds [[layer]].
   * @param layer The layer over which should be iterated.
   */
  constructor(private map: TmxMap, private layer: TmxTileLayer) {}

  /** Returns an iterator over all tiles on the active layer. */
  public *tiles(): IterableIterator<TileNode> {
    // We instantiate this with empty properties to re-use the same instance when
    // iterating over tiles.
    const node = new TileNode(0, undefined as unknown as Tileset);

    for (let i = 0, l = this.layer.data.length; i < l; i++) {
      const gid = this.layer.data[i];

      // Tiles with an id of 0 are empty and can be skipped.
      if (!gid) {
        continue;
      }

      // Get tileset and calculate local tile index from global id.
      node.tileset = this.map.tileset(gid);
      node.tileIdx = node.tileset.toLocal(gid) - 1;

      // Update tile position.
      this.map.grid.toCenter(this.map.grid.pos(i, node));

      yield node;
    }
  }

}

/** @internal */
function spawnTileLayer(world: World, map: TmxMap, layer: TmxTileLayer, parent: Entity): GameMapLayer {
  const tilemap = new Tilemap(
    map.grid,
    map.tilesets,
    layer.data,
    parent
  );

  const iterator = new TileLayerIterator(map, layer);
  const unitSize = world.get(ScreenDimensions).unitSize;

  for (const tile of iterator.tiles()) {
    const properties = tile.tileset.properties.get(tile.tileIdx) ?? {};

    if (tile.shapes) {
      const colliders = tile.shapes.filter(shape => shape.type === ShapeType.COLLISION);

      if (colliders.length > 0) {
        world
          .builder()
          .use(new Transform(
            tile.x / unitSize,
            tile.y / unitSize
          ))
          .use(createObjectRigidBody(
            unitSize,
            colliders,
            properties?.physicsBodyType,
            properties?.physicsDamping
          ))
          .build();
      }
    }
  }

  const entity = world
    .builder()
    .use(tilemap)
    .build();

  return new GameMapLayer(parent, [ entity ]);
}

/** @internal */
function spawnBodyFromShape(world: World, us: number, shape: Shape<unknown>): Entity {
  const data = convertShape(shape, us);

  data.x = 0;
  data.y = 0;

  return world
    .builder()
    .use(new RigidBody().attach(data))
    .use(new Transform(shape.data.x / us, shape.data.y / us))
    .build()
}

function convertShape(shape: Shape<unknown>, us: number): ColliderShape {
  const data = shape.data.copy();

  data.x /= us;
  data.y /= us;

  if (data instanceof Circle) {
    data.radius /= us;
  }
  else {
    data.height /= us;
    data.width /= us;
  }

  return data;
}

/** @internal */
function createObjectRigidBody(
  unitSize: number,
  shapes: Shape<CollisionShapeProperties>[],
  type = RigidBodyType.Static,
  damping?: number
): RigidBody {
  const body = new RigidBody(type);

  // Apply linear damping if it was set, otherwise use the physics module defaults.
  if (damping) {
    body.damping = damping;
  }

  for (const item of shapes) {
    const shape = convertShape(item, unitSize);

    body.attach(shape, {
      material: item.properties.physicsMaterial
    });
  }

  return body;
}

/** @internal */
export function spawnObjectLayer(
  world: World,
  map: TmxMap,
  layer: TmxObjectLayer,
  parentNode: Entity
): GameMapLayer {
  const entities = [];
  const unitSize = world.get(ScreenDimensions).unitSize;

  for (const obj of layer.data) {
    const tileset = map.tileset(obj.tileId);
    const tileId = tileset.toLocal(obj.tileId) - 1;

    const entity = world
      .builder()
      .use(new Transform(obj.x / unitSize, obj.y / unitSize))
      .use(new SpriteDisplay(tileset.spritesheet, tileId, parentNode).flip(
        obj.flipX,
        obj.flipY
      ));

    const properties = tileset.properties.get(tileId) ?? {};
    const shapes = tileset.shapes.get(tileId);

    // Add animation component if the properties specify an animation name.
    if (properties.animation) {
      entity.use(tileset.spritesheet.createAnimation(properties.animation));
    }

    if (shapes) {
      const colliders = shapes.filter(shape => shape.type === ShapeType.COLLISION);

      // If we have any shapes with "collision" type we'll add rigid body will all of
      // those shapes attached as colliders.
      if (colliders.length > 0) {
        entity.use(createObjectRigidBody(
          unitSize,
          colliders,
          properties?.physicsBodyType,
          properties?.physicsDamping
        ));
      }
    }

    entities.push(entity.build());
  }

  // Spawn free-floating collision shapes.
  for (const _shape of layer.shapes) {
    const shape = _shape as Shape<unknown, string>;

    if (shape.type === ShapeType.COLLISION) {
      entities.push(spawnBodyFromShape(world, unitSize, shape));
    }
    else {
      // Todo: In the future this should not warn about unknown shapes, but rather
      //  collect them in an array of custom shapes.
      console.log(`Unknown shape type: ${shape.type}`);
    }
  }

  return new GameMapLayer(
    parentNode,
    entities,
    layer.properties.isFloor
  );
}

export function spawnLayer(world: World, map: TmxMap, layer: TmxLayer, parentNode: Entity): GameMapLayer {
  switch (layer.type) {
    case LayerType.Tiles:
      return spawnTileLayer(world, map, layer, parentNode);
    case LayerType.Objects:
      return spawnObjectLayer(world, map, layer, parentNode);
    default:
      throw new Error('Unable to spawn layer');
  }
}
