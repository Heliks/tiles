import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Vec2 } from '@heliks/tiles-engine';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { parseCustomProperties, parseLayers, TmxMapAsset, TmxTileset } from '../parser';
import { isLocalTilesetExternal, TmxLocalTilesetData, TmxMapData } from '../tmx';


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
function getMapSize(data: TmxMapData): Vec2 {
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
function parseChunkLayout(data: TmxMapData): Grid {
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
function getChunkTileLayout(data: TmxMapData): Grid {
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
async function parseLocalTileset(loader: AssetLoader, file: string, data: TmxLocalTilesetData): Promise<LocalTileset<TmxTileset>> {
  // Note: As of now, there is no way to serialize sprites that are created from assets
  // without a source location. Therefore, we can not spawn objects that use sprites
  // from embedded tilesets without completely breaking serialization.
  if (! isLocalTilesetExternal(data)) {
    throw new Error('Embedded Tilesets are not supported.');
  }

  const tileset = await loader.fetch<TmxTileset>(getDirectory(file, data.source));

  return new LocalTileset(tileset, data.firstgid);
}

/** @internal */
function parseLocalTilesets(loader: AssetLoader, file: string, data: TmxMapData): Promise<LocalTileset<TmxTileset>[]> {
  return Promise.all(
    data.tilesets.map(
      tilesetData => parseLocalTileset(loader, file, tilesetData)
    )
  );
}

/** @internal */
function parseTilemap<P = unknown>(file: string, data: TmxMapData): TmxMapAsset<P> {
  return new TmxMapAsset<P>(
    file,
    new Grid(
      data.width,
      data.height,
      data.tilewidth,
      data.tileheight
    ),
    parseChunkLayout(data),
    parseCustomProperties<P>(data)
  );
}

/**
 * Asset loader format to parse Tiled `.tmj` tile-maps.
 *
 * ## Tilesets
 *
 * Tilesets that are attached to the map will be loaded automatically.
 *
 * See: {@link TmxLoadTileset}
 *
 * ## Shapes
 *
 * To be consistent with other engine modules, all shape positions are converted to
 * relative to the shapes center. By default, tiled used the top-left corner instead.
 *
 * ### Ellipses
 *
 * Elliptic shapes are not supported by the game engine, hence why all ellipses are
 * converted to circles. The radius will be the larger of the two sides of the ellipsis.
 *
 * - `P`: Expected custom properties.
 */
export class TmxLoadTilemap<P = unknown> implements Format<TmxMapData, TmxMapAsset<P>> {

  /** @inheritDoc */
  public readonly extensions = ['tmj'];

  /** @inheritDoc */
  public async process(data: TmxMapData, file: string, loader: AssetLoader): Promise<TmxMapAsset<P>> {
    const tilemap = parseTilemap<P>(file, data);
    const tilesets = await parseLocalTilesets(loader, file, data);
    
    for (const tileset of tilesets) {
      tilemap.tilesets.set(tileset);
    }

    // Create the layout of each individual chunk. We need this to parse tile layers.
    const chunkTileGrid = getChunkTileLayout(data);

    tilemap.layers.push(...parseLayers(data, chunkTileGrid));

    return tilemap;
  }

}
