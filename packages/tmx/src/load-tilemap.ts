import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, vec2, Vec2 } from '@heliks/tiles-math';
import { Tileset } from '@heliks/tiles-tilemap';
import {
  Layer,
  TmxExternalTilemapTileset,
  TmxLayerType,
  tmxParseObjectLayer,
  tmxParseTileLayer,
  TmxTilemap,
  TmxTilemapTileset
} from './layers';
import { LoadTileset } from './load-tileset';
import { Tilemap } from './tilemap';


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

/** @internal */
function parseLayers(data: TmxTilemap): Layer[] {
  // Create the layout of each individual chunk. We need this to parse tile layers.
  const layout = getChunkTileLayout(data);
  const layers = [];

  for (const item of data.layers) {
    let layer;

    switch (item.type) {
      case TmxLayerType.Tiles:
        layer = tmxParseTileLayer(item, layout);
        break;
      case TmxLayerType.Objects:
        layer = tmxParseObjectLayer(item);
        break;
    }

    layers.push(layer);
  }

  return layers;
}


/**
 * Returns the size of the given tmx map `data` (amount of columns on x axis and
 * amount of columns on y axis). This also returns the size of "infinite maps" which
 * according to the tiled format would have a width and height of `0`.
 */
function getMapSize(data: TmxTilemap): Vec2 {
  const size = vec2(data.width, data.height);

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

/** @internal */

/**
 * Returns a `Grid` that describes the layout in which chunks are arranged on the given
 * tilemap `data`. Columns and rows determine amount of chunks in each direction, cell
 * size determines amount of tiles in each chunk.
 *
 * @see Grid
 */
function getMapChunksLayout(data: TmxTilemap): Grid {
  let cw = TMX_DEFAULT_CHUNK_SIZE;
  let ch = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    cw = data.editorsettings.chunksize.width;
    ch = data.editorsettings.chunksize.height;
  }

  const size = getMapSize(data);

  return new Grid(
    Math.ceil(size.x / cw),
    Math.ceil(size.y / ch),
    cw,
    ch
  );
}

/**
 * Returns a `Grid` that describes the tile arrangement in each chunk. The columns and
 * rows determine the amount of tiles in each chunk, cell size determines tile size.
 */
function getChunkTileLayout(data: TmxTilemap): Grid {
  let cw = TMX_DEFAULT_CHUNK_SIZE;
  let ch = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    cw = data.editorsettings.chunksize.width;
    ch = data.editorsettings.chunksize.height;
  }

  return new Grid(cw, ch, data.tilewidth, data.tileheight);
}


/** Asset loader format for loading TMX tilemaps. */
export class LoadTilemap implements Format<TmxTilemap, Tilemap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: TmxTilemap, file: string, loader: AssetLoader): Promise<Tilemap> {
    const tilemap = new Tilemap(
      new Grid(
        data.width,
        data.height,
        data.tilewidth,
        data.tileheight
      ),
      getMapChunksLayout(data)
    );

    // Load all tilesets simultaneously.
    const tilesets = await Promise.all(
      data.tilesets.map(item => processTileset(
        loader,
        getDirectory(file),
        item
      ))
    );

    tilemap.tilesets.push(...tilesets);
    tilemap.layers.push(...parseLayers(data));

    return tilemap;
  }

}