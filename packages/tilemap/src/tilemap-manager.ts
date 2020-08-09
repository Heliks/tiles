import { Injectable, World } from '@heliks/tiles-engine';
import { AssetLoader, AssetStorage } from '@heliks/tiles-assets';
import { Tilemap } from './tilemap';

@Injectable()
export class TilemapManager {

  /** Asset storage for tilemaps. */
  public readonly cache: AssetStorage<Tilemap> = new Map();

  constructor(protected readonly loader: AssetLoader) {}

  /** */
  public spawn(world: World, tilemap: Tilemap): void {
    let depth = 0;

    for (const layer of tilemap.getLayers()) {
      // Increase the depth when we encounter a floor layer. This makes sure that it is
      // rendered on a different layer than everything that came before.
      // if (layer.properties.isFloorLayer) {
      depth++;

      console.log(depth);

      // world.get(Stage).setLayerAsSortable(depth);
      // }

      // Check for manual overwrite of layer depth and spawn it.
      layer.spawn(world, tilemap, depth);
    }
  }

}
