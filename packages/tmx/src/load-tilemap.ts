import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Vec2 } from '@heliks/tiles-engine';
import { parseLayers } from './layers';
import { LoadTileset } from './load-tileset';
import { getCustomProperties, Properties } from './properties';
import { Tilemap } from './tilemap';
import { isLocalTilesetExternal, TmxLocalTilesetData, TmxTilemap } from './tmx';
import { LocalTileset, LocalTilesetBag } from '@heliks/tiles-tilemap';


/**
 * Default value for the amount of tiles that a chunk occupies. Will be used as a
 * fallback if editor-settings are not available in the provided format.
 *
 * @internal
 */
const TMX_DEFAULT_CHUNK_SIZE = 16;

/**
 * Returns the size of the given tmx map `data` (amount of columns on x axis and
 * amount of columns on y axis).
 *
 * This also returns the size of "infinite maps" which according to the tiled format
 * would have a width and height of `0`.
 *
 * @internal
 */
function getMapSize(data: TmxTilemap): Vec2 {
  const size = new Vec2(data.width, data.height);

  if (! data.infinite) {
    return size;
  }

  // Determine size of infinite maps by finding the largest layer.
  for (const layer of data.layers) {
    if (layer.width > size.x) {
      size.x = layer.width;
    }

    if (layer.height > size.y) {
      size.y = layer.height;
    }
  }

  return size;
}


/**
 * Returns a `Grid` that describes the layout in which chunks should be arranged on the
 * given tilemap `data`.
 *
 * Columns and rows determine amount of chunks in each direction, cell size determines
 * amount of tiles in each chunk.
 *
 * Maps that are not "infinite" will always only have a single chunk that covers the
 * size of the whole map.
 *
 * @internal
 */
function getChunkLayout(data: TmxTilemap): Grid {
  const size = getMapSize(data);

  if (! data.infinite) {
    return new Grid(1, 1, size.x, size.y);
  }

  let chunksX = TMX_DEFAULT_CHUNK_SIZE;
  let chunksY = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    chunksX = data.editorsettings.chunksize.width;
    chunksY = data.editorsettings.chunksize.height;
  }

  return new Grid(
    Math.ceil(size.x / chunksX),
    Math.ceil(size.y / chunksY),
    chunksX,
    chunksY
  );
}

/**
 * Creates a {@link Grid grid} that defines the layout of an individual chunk on a
 * tilemap. Columns and rows define the number of tiles in each direction, while cell
 * size represents the tile size.
 *
 * Maps with a fixed size (e.g. maps that don't have the "infinite" option enabled) will
 * always have a single chunk that covers the whole area of the map.
 *
 * @internal
 */
function getChunkTileLayout(data: TmxTilemap): Grid {
  let tilesX = TMX_DEFAULT_CHUNK_SIZE;
  let tilesY = TMX_DEFAULT_CHUNK_SIZE;

  if (data.infinite) {
    if (data.editorsettings?.chunksize) {
      tilesX = data.editorsettings.chunksize.width;
      tilesY = data.editorsettings.chunksize.height;
    }
  }
  else {
    const size = getMapSize(data);

    tilesX = size.x;
    tilesY = size.y;
  }

  return new Grid(
    tilesX,
    tilesY,
    data.tilewidth,
    data.tileheight
  );
}

/** @internal */
async function loadTileset(data: TmxLocalTilesetData, basePath: string, loader: AssetLoader): Promise<LocalTileset> {
  const format = new LoadTileset();

  // If the tileset is external, load it. Otherwise, parse it directly.
  const tileset = await (
    isLocalTilesetExternal(data)
      ? loader.fetch(`${basePath}/${data.source}`, format)
      : format.process(data, '.embedded-tileset', loader)
  );

  return new LocalTileset(tileset, data.firstgid);
}

/**
 * Asset loader format for TMX tile maps (`.tmj`).
 *
 * - `P`: Expected custom properties.
 */
export class LoadTilemap<P extends Properties = Properties> implements Format<TmxTilemap, Tilemap<P>> {

  /** @inheritDoc */
  public readonly extensions = ['tmj'];

  /** @inheritDoc */
  public getAssetType(): typeof Tilemap {
    return Tilemap;
  }

  /** @inheritDoc */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap<P>> {
    const basePath = getDirectory(file);

    const tilemap = new Tilemap<P>(
      new Grid(data.width, data.height, data.tilewidth, data.tileheight),
      getChunkLayout(data),
      getCustomProperties<P>(data)
    );

    // Load all tilesets simultaneously.
    const assets = await Promise.all(
      data.tilesets.map(
        item => loadTileset(item, basePath, loader)
      )
    );

    for (const asset of assets) {
      tilemap.tilesets.set(asset);
    }

    // Create the layout of each individual chunk. We need this to parse tile layers.
    const chunkTileGrid = getChunkTileLayout(data);

    tilemap.layers.push(...parseLayers(data, chunkTileGrid));

    return tilemap;
  }

}
