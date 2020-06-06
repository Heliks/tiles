import { Injectable } from "@tiles/injector";
import { AssetLoader, AssetStorage, Handle } from "@tiles/assets";
import { Tilemap, TmxTilemapFormat } from "tilemap";

@Injectable()
export class TilemapManager {

  /** Asset storage for tilemaps. */
  protected readonly cache: AssetStorage<Tilemap> = new Map();

  constructor(protected readonly loader: AssetLoader) {}

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

  public spawn(handle: Handle<Tilemap>) {
    const tilemap = this.get(handle);

    console.log(tilemap);
  }

}
