import { Container, SortNode, SpriteDisplay, Stage } from '@heliks/tiles-pixi';
import { Tilemap } from '@heliks/tiles-tilemap';
import { Layer } from './game-map';
import { Transform, World } from '@heliks/tiles-engine';
import { LayerType, TmxLayer, TmxMap, TmxObjectLayer, TmxTileLayer } from './parser';

/** @internal */
function spawnTileLayer(world: World, stage: Stage, map: TmxMap, layer: TmxTileLayer): Layer {
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

  return new Layer(node, [
    entity
  ]);
}

/** @internal */
function spawnObjectLayer(world: World, stage: Stage, map: TmxMap, layer: TmxObjectLayer): Layer {
  const node = stage.registerNode(new SortNode());
  const entities = [];

  for (const obj of layer.data) {
    const tileset = map.tileset(obj.tileId);
    const entity = world
      .builder()
      // Todo: Use real unit size.
      .use(new Transform(
        obj.x / 16,
        obj.y / 16
      ))
      .use(new SpriteDisplay(
        tileset.spritesheet,
        tileset.toLocal(obj.tileId) - 1,
        node
      ))
      .build();

    entities.push(entity);
  }

  return new Layer(node, entities, true);
}

export function spawnLayer(world: World, map: TmxMap, layer: TmxLayer): Layer {
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
