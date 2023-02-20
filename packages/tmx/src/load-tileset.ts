import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Align, LoadTexture, SpriteGrid, SpriteSheet } from '@heliks/tiles-pixi';
import { parseCustomProperties } from './tmx-properties';
import { TmxTileset } from './tmx-tileset';
import { TmxTileData, TmxTilesetData } from './tmx';
import { Texture } from 'pixi.js';


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

/**
 * Parses TMX tile data and adds the extracted information to the given `tileset`.
 *
 * @param tileset Tileset to which tile information should be added.
 * @param tile Tile data that should be parsed.
 */
export function parseTile(tileset: TmxTileset, tile: TmxTileData): void {
  // The tileID here is actually just the tile index.. Convert it to a local ID.
  const tileId = tile.id + 1;

  // Assign shapes if tile has any.
  /*
  if (tile.objectgroup) {
    const shapes = tile
      .objectgroup
      .objects
      .map(item => parseShape(
        item,
        tileset.tileWidth,
        tileset.tileHeight
      ));

    tileset.setTileShapes(tileId, shapes);
  }
   */

  if (tile.animation) {
    const frames = [];

    // Duration of each frame in MS. Currently frame duration for individual frames is
    // not supported.
    let frameDuration = 100;

    for (const frameData of tile.animation) {
      frames.push(frameData.tileid);
      frameDuration = frameData.duration;
    }

    /*
    tileset.setAnimation(tileId, {
      frames,
      frameDuration
    });
     */
  }

  // Assign custom properties if the tile has any.
  if (tile.properties) {
    tileset.tileProperties.set(tileId, parseCustomProperties(tile));
  }
}

function getAlign(data: TmxTilesetData): Align {
  let align;

  if (data.objectalignment) {
    align = ALIGN_LOOKUP[ data.objectalignment ];
  }

  return align ?? Align.BottomLeft
}

/** Format to load TMX tilesets. */
export class LoadTileset implements Format<TmxTilesetData, TmxTileset> {

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

    /*
    if (data.tiles) {
      for (const tile of data.tiles) {
        parseTile(tileset, tile);
      }
    }
     */

    return tileset;
  }

}
