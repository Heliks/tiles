import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-math';
import { LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { HasPropertiesFormat } from './properties';
import { TmxShapeData } from './shape';
import { Tileset } from './tileset';


interface TileFormat extends HasPropertiesFormat {
  animation?: {
    duration: number;
    tileid: number;
  }[];
  id: number;
  objectgroup?: {
    objects: TmxShapeData[]
  }
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TilesetFormat extends HasPropertiesFormat {
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
  tiles?: TileFormat[];
  type: 'tileset';
}

async function foo(data: TilesetFormat, file: string, loader: AssetLoader) {
  // Amount of rows is not contained in the tiled format so it needs to be calculated
  // manually. The number is rounded down to cut of partial tiles.
  const grid = new Grid(
    data.columns,
    Math.floor(data.imageheight / data.tileheight),
    data.tilewidth,
    data.tileheight
  );

  const texture = await loader.fetch(file, new LoadTexture());

  return new SpriteGrid(grid, texture);
}

/** Format to load TMX tilesets. */
export class LoadTileset implements Format<TilesetFormat, Tileset> {

  /** @inheritDoc */
  public readonly name = 'tmx-tileset';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /**
   * @param firstId Id that should be used as the first ID of the ID range of the
   *  tileset that is being loaded.
   */
  constructor(public readonly firstId = 1) {}

  /** Creates a `Tileset` from `data`. */
  public async process(data: TilesetFormat, file: string, loader: AssetLoader): Promise<Tileset> {
    // Tiled uses relative paths -> convert it to the absolute image path.
    const image = `${getDirectory(file)}/${data.image}`;
    const sheet = await foo(data, image, loader);

    return new Tileset(sheet, this.firstId);
  }

}