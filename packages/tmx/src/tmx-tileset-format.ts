import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { TmxTilesetData } from './tmx-json';
import { SpriteGrid, TextureFormat } from '@heliks/tiles-pixi';
import { Tileset } from '@heliks/tiles-tilemap';
import { Grid } from '@heliks/tiles-engine';

/** Asset loader format for loading TMX tilesets. */
export class TmxTilesetFormat implements Format<TmxTilesetData, Tileset> {

  /** @inheritDoc */
  public readonly name = 'tmx-tileset';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  constructor(public readonly firstId = 1) {}

  /** Creates a `Tileset` from `data`. */
  public async process(data: TmxTilesetData, file: string, loader: AssetLoader): Promise<Tileset> {
    // Amount of rows is not contained in the tiled format so it needs to be calculated
    // manually. The number is rounded down to cut of partial tiles.
    const grid = new Grid(
      data.columns,
      Math.floor(data.imageheight / data.tileheight),
      data.tilewidth,
      data.tileheight
    );

    // Convert the relative path in the tiled format.
    const source = `${getDirectory(file)}/${data.image}`;

    // Load the texture.
    const texture = await loader.fetch(source, new TextureFormat());

    return new Tileset(new SpriteGrid(grid, texture), this.firstId);
  }

}



