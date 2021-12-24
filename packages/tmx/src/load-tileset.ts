import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Align, LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { parseShape } from './shape';
import { Tileset } from './tileset';
import { TmxTilemapTile, TmxTileset } from './tmx';


// Lookup to map TmxTilesetObjectAlignment values to Align values.
const ALIGN_LOOKUP = {
  'right': Align.Right,
  'left': Align.Left,
  'center': Align.Center,
  'top': Align.Top,
  'topleft': Align.TopLeft,
  'topright': Align.TopRight,
  'bottom': Align.Bottom,
  'bottomleft': Align.BottomLeft,
  'bottomright': Align.BottomRight
};

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

/** @internal */
function parseTile(tileset: Tileset, tile: TmxTilemapTile): void {
  if (tile.objectgroup) {
    const shapes = tile.objectgroup.objects.map(item => parseShape(
      item,
      tileset.tileWidth,
      tileset.tileHeight
    ));

    tileset.setTileShapes(tile.id, shapes);
  }
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
    const image = getDirectory(file, data.image);
    const sheet = await load(data, image, loader);

    const tileset = new Tileset(
      sheet,
      this.firstId,
      data.tilewidth,
      data.tileheight
    );

    if (data.objectalignment) {
      tileset.objectAlign = ALIGN_LOOKUP[ data.objectalignment ] ?? Align.BottomLeft;
    }

    if (data.tiles) {
      for (const tile of data.tiles) {
        parseTile(tileset, tile);
      }
    }

    console.log(tileset);

    return tileset;
  }

}