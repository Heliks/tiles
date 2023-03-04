import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Pivot, PivotPreset } from '@heliks/tiles-engine';
import { Align, SpriteGrid } from '@heliks/tiles-pixi';
import { TmxTileset } from '../parser';
import { TmxTilesetData } from '../tmx';
import { Texture } from 'pixi.js';
import { parseTileData } from '../parser';


/** @internal */
const PIVOT_PRESET_LOOKUP = {
  'right': PivotPreset.RIGHT,
  'left': PivotPreset.LEFT,
  'center': PivotPreset.CENTER,
  'top': PivotPreset.TOP,
  'topleft': PivotPreset.TOP_LEFT,
  'topright': PivotPreset.TOP_RIGHT,
  'bottom': PivotPreset.BOTTOM,
  'bottomleft': PivotPreset.BOTTOM_LEFT,
  'bottomright': PivotPreset.BOTTOM_RIGHT
};

/** @internal */
function parsePivot(data: TmxTilesetData): Pivot {
  let pivot;

  if (data.objectalignment) {
    pivot = PIVOT_PRESET_LOOKUP[ data.objectalignment ];
  }

  return pivot ?? PivotPreset.BOTTOM_LEFT;
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

    tileset.pivot = parsePivot(data);

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
