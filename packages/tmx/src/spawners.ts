import { Container, ScreenDimensions, SortNode, SpriteDisplay, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameMapLayer } from './game-map';
import { Transform, World } from '@heliks/tiles-engine';
import { LayerType, TmxLayer, TmxMap, TmxObjectLayer, TmxTileLayer } from './parser';
import { RigidBody } from '@heliks/tiles-physics';
import { Circle, Rectangle } from '@heliks/tiles-math';

/** @internal */
function spawnTileLayer(world: World, stage: Stage, map: TmxMap, layer: TmxTileLayer): GameMapLayer {
  const node = stage.registerNode(new Container());
  const entity = world
    .builder()
    .use(new Tilemap(
      map.grid,
      map.tilesets,
      layer.data,
      node
    ))
    .build();

  return new GameMapLayer(node, [
    entity
  ]);
}

/** @internal */
function spawnObjectLayer(world: World, stage: Stage, map: TmxMap, layer: TmxObjectLayer): GameMapLayer {
  const entities = [];
  const node = stage.registerNode(new SortNode());
  const us = world.get(ScreenDimensions).unitSize;

  for (const obj of layer.data) {
    const tileset = map.tileset(obj.tileId);
    const tileId = tileset.toLocal(obj.tileId) - 1;

    const entity = world
      .builder()
      // Convert pixel position to world coordinates.
      .use(new Transform(obj.x / us, obj.y / us))
      .use(new SpriteDisplay(
        tileset.spritesheet,
        tileId,
        node
      ));

    const properties = tileset.properties.get(tileId);

    // Add animation component if the properties specify an animation name.
    if (properties?.animation) {
      entity.use(tileset.spritesheet.createAnimation(properties.animation));
    }

    const shapes = tileset.shapes.get(tileId);

    if (shapes) {
      const colliders = shapes.filter(shape => shape.type === 'collision');

      if (colliders.length) {
        const body = new RigidBody();

        for (const collider of colliders) {
          const shape = collider.data.copy();

          shape.x /= us;
          shape.y /= us;

          if (shape instanceof Rectangle) {
            shape.height /= us;
            shape.width /= us;
          }
          else {
            shape.radius /= us;
          }

          body.attach(shape);
        }

        entity.use(body);
      }
    }

    entities.push(entity.build());
  }

  return new GameMapLayer(
    node,
    entities,
    layer.properties.isPawnLayer
  );
}

export function spawnLayer(world: World, map: TmxMap, layer: TmxLayer): GameMapLayer {
  const stage = world.get(Stage);

  switch (layer.type) {
    case LayerType.Tiles:
      return spawnTileLayer(world, stage, map, layer);
    case LayerType.Objects:
      return spawnObjectLayer(world, stage, map, layer);
    default:
      throw new Error('Unable to spawn layer');
  }
}
