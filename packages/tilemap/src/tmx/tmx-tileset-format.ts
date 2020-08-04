import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { TmxTileset } from './tmx-json';
import { TextureFormat } from '@heliks/tiles-pixi';
import { Tileset } from '../tileset';

/** Asset loader format for loading TMX tilesets. */
export class TmxTilesetFormat implements Format<TmxTileset, Tileset> {

  /** @inheritDoc */
  public readonly name = 'tmx-tileset';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** Creates a `Tileset` from `data`. */
  public async process(data: TmxTileset, file: string, loader: AssetLoader): Promise<Tileset> {
    // Amount of rows is not contained in the tiled format so it needs to be calculated
    // manually. The number is rounded down to cut of partial tiles.
    const rows = Math.floor(data.imageheight / data.tileheight);

    // Convert the relative path.
    const source = `${getDirectory(file)}/${data.image}`;

    // Load the texture and create a sprite sheet from it.
    return new Tileset(
      data.name,
      await loader.fetch(source, new TextureFormat()),
      data.columns,
      rows,
      data.tilewidth,
      data.tileheight
    );
  }

}
