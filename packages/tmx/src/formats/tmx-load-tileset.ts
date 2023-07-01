import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Pivot, PivotPreset } from '@heliks/tiles-engine';
import { SpriteGrid } from '@heliks/tiles-pixi';
import { Sprite, Texture } from 'pixi.js';
import { parseCustomProperties, parseTileData, TmxTileset, TmxTilesetProps } from '../parser';
import { TmxTilesetData } from '../tmx';


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

/** @internal */
function createSpriteGrid(grid: Grid, texture: Texture, props: TmxTilesetProps): SpriteGrid {
  const spritesheet = new SpriteGrid(grid, texture);

  if (props.$animations) {
    const animations = JSON.parse(props.$animations);

    for (const animation of animations) {
      spritesheet.setAnimation(animation.name, animation);
    }
  }

  return spritesheet;
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
    const props = parseCustomProperties<TmxTilesetProps>(data);
    const spritesheet = createSpriteGrid(grid, texture, props)
    const handle = loader.data(file, spritesheet);
    const tileset = new TmxTileset(handle, grid.size, props);

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
