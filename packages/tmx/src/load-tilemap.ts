import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid, vec2, Vec2 } from '@heliks/tiles-math';
import { Layer, TmxLayerData, TmxLayerDataType, tmxParseObjectLayer, tmxParseTileLayer } from './layers';
import { LoadTileset, TilesetFormat } from './load-tileset';
import { HasPropertiesFormat } from './properties';
import { Tilemap } from './tilemap';
import { Tileset } from '@heliks/tiles-tilemap';


/** An external tileset that must be loaded manually. */
interface TilemapExternalTilesetFormat {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
interface TilemapEmbeddedTilesetFormat extends TilesetFormat {
  firstgid: number;
}

/** @internal */
type TilesetData = TilemapExternalTilesetFormat | TilemapEmbeddedTilesetFormat;

interface TmxEditorSettings {
  chunksize?: {
    height: number;
    width: number;
  }
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxTilemapData extends HasPropertiesFormat {
  backgroundcolor: string;
  editorsettings?: TmxEditorSettings;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayerData[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  tiledversion: string;
  tileheight: number;
  tilesets: TilesetData[];
  tilewidth: number;
  type: 'map';
  width: number;
}


/** @internal */
function isExternalTileset(data: TilesetData): data is TilemapExternalTilesetFormat {
  return (data as TilemapExternalTilesetFormat).source !== undefined;
}

/** @internal */
async function processTileset(loader: AssetLoader, basePath: string, data: TilesetData): Promise<Tileset> {
  const format = new LoadTileset(data.firstgid);

  // If the given data is an external tileset we load it using the loader. Otherwise
  // we can simply parse it directly.
  return isExternalTileset(data)
    ? loader.fetch(`${basePath}/${data.source}`, format)
    : format.process(data, '', loader);
}

/** @internal */
function parseLayers(data: TmxTilemapData): Layer[] {
  const layers = [];

  for (const item of data.layers) {
    let layer;

    switch (item.type) {
      case TmxLayerDataType.Tiles:
        layer = tmxParseTileLayer(item);
        break;
      case TmxLayerDataType.Objects:
        layer = tmxParseObjectLayer(item);
        break;
    }

    layers.push(layer);
  }

  return layers;
}

/**
 * Default value for the amount of tiles that a chunk occupies. Will be used as a
 * fallback if editor-settings are not available in the provided format.
 */
const TMX_DEFAULT_CHUNK_SIZE = 16;

/**
 * Returns the size of the given tmx map `data` (amount of columns on x axis and
 * amount of columns on y axis). This also returns the size of "infinite maps" which
 * according to the tiled format would have a width and height of `0`.
 */
export function tmxGetMapSize(data: TmxTilemapData): Vec2 {
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
function createMapChunksGrid(data: TmxTilemapData): Grid {
  let cw = TMX_DEFAULT_CHUNK_SIZE;
  let ch = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    cw = data.editorsettings.chunksize.width;
    ch = data.editorsettings.chunksize.height;
  }

  const size = tmxGetMapSize(data);

  return new Grid(
    Math.ceil(size.x / cw),
    Math.ceil(size.y / ch),
    cw,
    ch
  );
}


/** Asset loader format for loading TMX tilemaps. */
export class LoadTilemap implements Format<TmxTilemapData, Tilemap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: TmxTilemapData, file: string, loader: AssetLoader): Promise<Tilemap> {
    const chunks = createMapChunksGrid(data);

    console.log(chunks)

    const tilemap = new Tilemap(
      new Grid(
        data.width,
        data.height,
        data.tilewidth,
        data.tileheight
      )
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