import { Container, ScreenDimensions, SortNode, SpriteDisplay, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { GameMapLayer } from './game-map';
import { Transform, World } from '@heliks/tiles-engine';
import { LayerType, TmxLayer, TmxMap, TmxObjectLayer, TmxTileLayer } from './parser';

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
    const entity = world
      .builder()
      // Convert pixel position to world coordinates.
      .use(new Transform(obj.x / us, obj.y / us))
      .use(new SpriteDisplay(
        tileset.spritesheet,
        tileset.toLocal(obj.tileId) - 1,
        node
      ))
      .build();

    entities.push(entity);
  }

  console.log(layer.properties)

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
