import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { SpriteGrid, TextureFormat } from '@heliks/tiles-pixi';
import { Tileset } from '@heliks/tiles-tilemap';
import { Grid } from '@heliks/tiles-engine';
import { HasTmxPropertyData } from './properties';

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTilesetData extends HasTmxPropertyData {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  type: 'tileset';
}

/** Asset loader format for TMX tilesets. */
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



