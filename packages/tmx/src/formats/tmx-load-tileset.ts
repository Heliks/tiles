import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Align, SpriteGrid } from '@heliks/tiles-pixi';
import { TmxTileset } from '../parser/tmx-tileset';
import { TmxTilesetData } from '../tmx';
import { Texture } from 'pixi.js';
import { parseTileData } from '../parser/tmx-tile';


/** @internal */
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


function getAlign(data: TmxTilesetData): Align {
  let align;

  if (data.objectalignment) {
    align = ALIGN_LOOKUP[ data.objectalignment ];
  }

  return align ?? Align.BottomLeft
}

/** Format to load TMX tilesets. */
export class TmxLoadTileset implements Format<TmxTilesetData, TmxTileset> {

  /** @inheritDoc */
  public readonly extensions = ['tsj'];

  /** Creates a `Tileset` from `data`. */
  public async process(data: TmxTilesetData, file: string, loader: AssetLoader): Promise<TmxTileset> {
    const grid = new Grid(
      Math.floor(data.imagewidth / data.tilewidth),
      Math.floor(data.imageheight / data.tileheight),
      data.tilewidth,
      data.tileheight
    );

    const texture = await loader.fetch<Texture>(getDirectory(file, data.image));
    const handle = loader.data(file, new SpriteGrid(grid, texture));
    const tileset = new TmxTileset(handle, grid.size);

    tileset.align = getAlign(data);

    if (data.tiles) {
      for (const tileData of data.tiles) {
        const tile = parseTileData(tileset, tileData);

        tileset.tiles.set(tile.id, tile);
      }
    }


    return tileset;
  }

}
