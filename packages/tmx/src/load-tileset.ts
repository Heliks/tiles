import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-engine';
import { Align, LoadTexture, SpriteGrid } from '@heliks/tiles-pixi';
import { getProperties } from './properties';
import { parseShape } from './shape';
import { Tileset } from './tileset';
import { TmxTileset, TmxTilesetTile } from './tmx';


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


/**
 * Parses TMX tile data and adds the extracted information to the given `tileset`.
 *
 * @param tileset Tileset to which tile information should be added.
 * @param tile Tile data that should be parsed.
 */
export function parseTile(tileset: Tileset, tile: TmxTilesetTile): void {
  // The tileID here is actually just the tile index.. Convert it to a local ID.
  const tileId = tile.id + 1;

  // Assign shapes if tile has any.
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

  if (tile.animation) {
    const frames = [];

    // Duration of each frame in MS. Currently frame duration for individual frames is
    // not supported.
    let frameDuration = 100;

    for (const frameData of tile.animation) {
      frames.push(frameData.tileid);
      frameDuration = frameData.duration;
    }

    tileset.setAnimation(tileId, {
      frames,
      frameDuration
    });
  }

  // Assign custom properties if the tile has any.
  if (tile.properties) {
    tileset.tileProperties.set(tileId, getProperties(tile));
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

  /** @inheritDoc */
  public getAssetType(): typeof Tileset {
    return Tileset;
  }

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

    return tileset;
  }

}
