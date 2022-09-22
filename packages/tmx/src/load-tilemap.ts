import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, Vec2 } from '@heliks/tiles-engine';
import { parseLayers } from './layers';
import { LoadTileset } from './load-tileset';
import { getProperties, Properties } from './properties';
import { Tilemap } from './tilemap';
import { Tileset } from './tileset';
import { TmxExternalTilemapTileset, TmxTilemap, TmxTilemapTileset } from './tmx';


/**
 * Default value for the amount of tiles that a chunk occupies. Will be used as a
 * fallback if editor-settings are not available in the provided format.
 */
const TMX_DEFAULT_CHUNK_SIZE = 16;

/** @internal */
function isExternalTileset(data: TmxTilemapTileset): data is TmxExternalTilemapTileset {
  return (data as TmxExternalTilemapTileset).source !== undefined;
}

/** @internal */
async function processTileset(loader: AssetLoader, basePath: string, data: TmxTilemapTileset): Promise<Tileset> {
  const format = new LoadTileset(data.firstgid);

  // If the given data is an external tileset we load it using the loader. Otherwise
  // we can simply parse it directly.
  return isExternalTileset(data)
    ? loader.fetch(`${basePath}/${data.source}`, format)
    : format.process(data, '', loader);
}

/**
 * Returns the size of the given tmx map `data` (amount of columns on x axis and
 * amount of columns on y axis).
 *
 * This also returns the size of "infinite maps" which according to the tiled format
 * would have a width and height of `0`.
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
 * @see Grid
 */
function getMapChunksLayout(data: TmxTilemap): Grid {
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
 * Returns a `Grid` that describes how tiles should be arranged in a chunk.
 *
 * Columns and rows determine the amount of tiles in each chunk, while cell size
 * determines the tile size.
 *
 * For maps that are not "infinite" the chunk will always cover the whole map.
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


/**
 * Asset loader format for loading TMX tile maps.
 *
 * @typeparam P Custom properties found on tile maps.
 */
export class LoadTilemap<P extends Properties = Properties> implements Format<TmxTilemap, Tilemap<P>> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public getAssetType(): typeof Tilemap {
    return Tilemap;
  }

  /** @inheritDoc */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap<P>> {
    const tilemap = new Tilemap<P>(
      new Grid(
        data.width,
        data.height,
        data.tilewidth,
        data.tileheight
      ),
      getMapChunksLayout(data),
      getProperties<P>(data)
    );

    // Load all tilesets simultaneously.
    const tilesets = await Promise.all(
      data.tilesets.map(item => processTileset(
        loader,
        getDirectory(file),
        item
      ))
    );

    // Create the layout of each individual chunk. We need this to parse tile layers.
    const chunkTileGrid = getChunkTileLayout(data);

    tilemap.tilesets.push(...tilesets);
    tilemap.layers.push(...parseLayers(data, chunkTileGrid));

    return tilemap;
  }

}
