import { Injectable } from '@tiles/injector';
import { AssetLoader, AssetStorage, Handle } from '@tiles/assets';
import { Tilemap } from './tilemap';
import { World } from '@tiles/engine';
import { TmxTilemapFormat } from './tmx';
import { Stage } from '@tiles/pixi';

@Injectable()
export class TilemapManager {

  /** Asset storage for tilemaps. */
  protected readonly cache: AssetStorage<Tilemap> = new Map();

  constructor(
    protected readonly loader: AssetLoader
  ) {}

  /**
   * Similar to [[load()]] but only returns the file handle after it has finished
   * loading.
   */
  public async(file: string): Promise<Handle<Tilemap>> {
    return this.loader.async(file, new TmxTilemapFormat(), this.cache);
  }

  /**
   * Loads the tilemap at `file` and returns a handle that can be used to access the
   * tilemap in storage.
   */
  public load(file: string): Handle<Tilemap> {
    return this.loader.load(file, new TmxTilemapFormat(), this.cache);
  }

  /**
   * Returns the `Tilemap` that was stored with the given `handle`. Throws an error
   * if no tilemap with that handle exists.
   */
  public get(handle: Handle<Tilemap>): Tilemap {
    const tilemap = this.cache.get(handle);

    if (! tilemap) {
      throw new Error('Tilemap not found');
    }

    return tilemap.data;
  }

  /** */
  public spawn(world: World, handle: Handle<Tilemap>): void {
    const tilemap = this.get(handle);

    let depth = 0;

    for (const layer of tilemap.layers) {
      // Increase the depth when we encounter a floor layer. This makes sure that it is
      // rendered on a different layer than everything that came before.
      if (layer.properties.isFloorLayer) {
        depth++;

        world.get(Stage).setLayerAsSortable(depth);
      }

      // Check for manual overwrite of layer depth and spawn it.
      layer.spawn(world, tilemap, layer.properties.depth ?? depth);
    }
  }

}
