import { spawnLayer, spawnObjectLayer } from './spawners';
import { GameMap } from './game-map';
import { Entity, World } from '@heliks/tiles-engine';
import { LayerType, TmxMap } from './parser';
import { RenderNode } from "@heliks/tiles-pixi";

/** @internal */
function createNode(world: World, sortable = false): Entity {
  return world.create([
    new RenderNode(sortable)
  ]);
}

export class GameMapHandler {

  /** Contains all maps that are currently spawned. */
  private readonly active = new Set<GameMap>();

  public spawn(world: World, asset: TmxMap): GameMap {
    let node = createNode(world)

    const layers = [];

    for (let i = 0, l = asset.layers.length; i < l; i++) {
      const data = asset.layers[i];

      if (data.type === LayerType.Objects) {
        if (data.properties.isPawnLayer) {
          // Create a new sortable object node.
          node = createNode(world, true);

          layers.push(spawnObjectLayer(world, asset, data, node));

          // If we have layers after this one we create a new node so that new layers
          // are rendered on top of this. If the next layer is another pawn layer
          // however we skip this as this will create a new sortable node anyway.
          if (!asset.layers[i + 1]?.properties.isPawnLayer) {
            node = createNode(world, false);
          }
        }
        else {
          // Meta layers don't need to be spawned on a new node.
          layers.push(spawnObjectLayer(world, asset, data, node));
        }
      }
      else {
        layers.push(spawnLayer(world, asset, data, node));
      }
    }

    const gMap = new GameMap(layers);

    this.active.add(gMap);

    return gMap;
  }

}
