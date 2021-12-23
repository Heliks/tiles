import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { Tileset } from '@heliks/tiles-tilemap';
import { TmxTileset } from './layers';


/** @internal */
async function load(data: TmxTileset, file: string, loader: AssetLoader): Promise<SpriteGrid> {
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
export class LoadTileset implements Format<TmxTileset, Tileset> {

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
  public async process(data: TmxTileset, file: string, loader: AssetLoader): Promise<Tileset> {
    // Tiled uses relative paths -> convert it to the absolute image path.
    const image = `${getDirectory(file)}/${data.image}`;
    const sheet = await load(data, image, loader);

    return new Tileset(
      sheet,
      this.firstId,
      data.tilewidth,
      data.tileheight
    );
  }

}