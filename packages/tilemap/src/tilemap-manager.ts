import { Injectable } from "@tiles/injector";
import { AssetLoader, AssetStorage, Handle } from "@tiles/assets";
import { Tilemap, TmxTilemapFormat } from "./tilemap";
import { LayerType } from "./layer";
import { Transform, World } from "@tiles/engine";
import { Renderer, SpriteDisplay } from "@tiles/pixi";

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

  public spawn(world: World, handle: Handle<Tilemap>): void {
    const tilemap = this.get(handle);

    const tw2 = tilemap.cellWidth / 2;
    const th2 = tilemap.cellHeight / 2;

    // Get the unit size from the renderer config.
    const us = world.get(Renderer).config.unitSize;

    for (const layer of tilemap.layers) {
      switch (layer.type) {
        case LayerType.Tiles:
          for (let i = 0, l = layer.data.length; i < l; i++) {
            const gId = layer.data[ i ];

            // A global tile ID "0" means that no tile exists at this index.
            if (gId === 0) {
              continue;
            }

            const position = tilemap.pos(i);
            const tileset = tilemap.tileset(gId);
            const idx = tileset.toLocal(gId) - 1;

            world.builder()
            // Tiled anchors tiles from the top left corner so we need to calculate the
            // center position manually.
              .use(new Transform(
                (position[ 0 ] + tw2) / us,
                (position[ 1 ] + th2) / us
              ))
              .use(new SpriteDisplay(tileset.tileset, idx))
              .build();
          }
          break;
        default:
          // This case should never happen in practice as it means that the compiled map
          // is either corrupt there is an implementation missing here. It doesn't
          // warrant a hard error however.
          console.warn('Skipping layer: type not implemented.', layer);
      }
    }
  }

}
