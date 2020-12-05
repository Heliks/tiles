import { ScreenDimensions, SpriteDisplay } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameMapLayer } from './game-map';
import { Circle, Entity, Transform, World } from '@heliks/tiles-engine';
import { LayerType, TileProperties, TmxLayer, TmxMap, TmxObjectLayer, TmxTileLayer } from './parser';
import { RigidBody, Shape as PhysicsShape } from '@heliks/tiles-physics';
import { Shape } from './parser/shape';

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

  return new GameMapLayer([
    entity
  ]);
}

/** @internal */
function applyUnitSizeToShape(shape: PhysicsShape, us: number): void {
  shape.x /= us;
  shape.y /= us;

  if (shape instanceof Circle) {
    shape.radius /= us;
  }
  else {
    shape.height /= us;
    shape.width /= us;
  }
}

/** @internal */
function spawnBodyFromShape(world: World, us: number, shape: Shape): void {
  const data = shape.data.copy();

  data.x = 0;
  data.y = 0;

  applyUnitSizeToShape(data, us);

  world
    .builder()
    .use(new RigidBody().attach(data))
    .use(new Transform(shape.data.x / us, shape.data.y / us))
    .build()
}

/** @internal */
function createObjectRigidBody(
  unitSize: number,
  shapes: Shape[],
  properties: TileProperties
): RigidBody {
  const body = new RigidBody(properties.physicsBodyType);

  // Only apply linear damping if it was manually set, otherwise use the physics
  // module defaults.
  if (properties.physicsDamping) {
    body.damping = properties.physicsDamping;
  }

  for (const item of shapes) {
    const shape = item.data.copy();

    applyUnitSizeToShape(shape, unitSize);

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
      const colliders = shapes.filter(shape => shape.type === 'collision');

      // If we have any shapes with "collision" type we'll add rigid body will all of
      // those shapes attached as colliders.
      if (colliders.length > 0) {
        entity.use(createObjectRigidBody(unitSize, colliders, properties));
      }
    }

    entities.push(entity.build());
  }

  // Spawn free-floating collision shapes.
  for (const shape of layer.shapes) {
    if (shape.type === 'collision') {
      spawnBodyFromShape(world, unitSize, shape);
    }
  }

  return new GameMapLayer(
    entities,
    layer.properties.isPawnLayer,
    parentNode
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
