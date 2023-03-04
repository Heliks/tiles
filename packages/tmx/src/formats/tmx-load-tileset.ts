import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Align, SpriteGrid } from '@heliks/tiles-pixi';
import { TmxTileset } from '../parser';
import { TmxTilesetData } from '../tmx';
import { Texture } from 'pixi.js';
import { parseTileData } from '../parser';


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

/** @internal */
function getAlign(data: TmxTilesetData): Align {
  let align;

  if (data.objectalignment) {
    align = ALIGN_LOOKUP[ data.objectalignment ];
  }

  return align ?? Align.BottomLeft
}

/** @internal */
function getTileAnimationName(tileIdx: number): string {
  return `TileAnimation${tileIdx}`;
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
    const spritesheet = new SpriteGrid(grid, texture);

    const handle = loader.data(file, spritesheet);
    const tileset = new TmxTileset(handle, grid.size);

    tileset.align = getAlign(data);

    if (data.tiles) {
      for (const tileData of data.tiles) {
        const tile = parseTileData(tileset, tileData);

        if (tile.animation) {
          const name = getTileAnimationName(tile.index);

          spritesheet.setAnimation(name, tile.animation);
          tileset.setAnimationName(tile.index, name);
        }

        tileset.tiles.set(tile.index, tile);
      }
    }

    return tileset;
  }

}
