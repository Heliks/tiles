import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameMapLayer } from './game-map';
import { Circle, Entity, Transform, World } from '@heliks/tiles-engine';
import {
  LayerType,
  TileProperties,
  TmxLayer,
  TmxMap,
  TmxObjectLayer,
  TmxTileLayer
} from './parser';
import { ColliderShape, MaterialId, RigidBody } from '@heliks/tiles-physics';
import { Shape } from './parser/shape';

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

/** @internal */
function spawnTileLayer(world: World, map: TmxMap, layer: TmxTileLayer, parentNode: Entity): GameMapLayer {
  const tt = new Tilemap(
    map.grid,
    map.tilesets,
    layer.data,
    parentNode
  );

  // (tt as any).$$NAME = layer.name;
  // console.log(layer.name)

  const entity = world
    .builder()
    .use(tt)
    .build();

  return new GameMapLayer(parentNode, [ entity ]);
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
  properties: TileProperties
): RigidBody {
  const body = new RigidBody(properties.physicsBodyType);

  // Only apply linear damping if it was manually set, otherwise use the physics
  // module defaults.
  if (properties.physicsDamping) {
    body.damping = properties.physicsDamping;
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
        entity.use(createObjectRigidBody(unitSize, colliders, properties));
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
    layer.properties.isPawnLayer
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
