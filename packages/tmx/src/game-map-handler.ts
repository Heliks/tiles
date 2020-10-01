import { spawnLayer } from './spawners';
import { GameMap } from './game-map';
import { World } from '@heliks/tiles-engine';
import { TmxMap } from './parser';

export class GameMapHandler {

  /** Contains all maps that are currently spawned. */
  private readonly active = new Set<GameMap>();

  public spawn(world: World, asset: TmxMap): GameMap {
    // Spawn all layers.
    const layers = asset.layers.map(layer => spawnLayer(world, asset, layer));
    const gMap = new GameMap(layers);

    this.active.add(gMap);

    return gMap;
  }

}
