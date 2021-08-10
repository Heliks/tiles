import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { TilesetBag } from '@heliks/tiles-tilemap';
import { Tileset, TmxTilesetData as TilesetBaseData, TmxTilesetFormat } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { HasTmxPropertyData } from './properties';
import { Vec2, vec2 } from '@heliks/tiles-math';
import { Layer, TmxLayerData, TmxLayerDataType, tmxParseObjectLayer, tmxParseTileLayer } from './layers';

/** An external tileset that must be loaded manually. */
interface TmxEternalTilesetData extends TilesetBaseData {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
interface TmxEmbeddedTilesetData extends TilesetBaseData {
  firstgid: number;
  source: undefined;
}

/** @internal */
type TilesetData = TmxEternalTilesetData | TmxEmbeddedTilesetData;

/** @internal */
function isExternalTileset(data: TilesetData): data is TmxEternalTilesetData {
  return data.source !== undefined;
}

/** @internal */
async function processTileset(loader: AssetLoader, basePath: string, data: TilesetData): Promise<Tileset> {
  const format = new TmxTilesetFormat(data.firstgid);

  // If the given data is an external tileset we load it using the loader. Otherwise
  // we can simply parse it directly.
  return isExternalTileset(data)
    ? loader.fetch(`${basePath}/${data.source}`, format)
    : format.process(data, '', loader);
}

interface TmxEditorSettings {
  chunksize?: {
    height: number;
    width: number;
  }
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxTilemapData extends HasTmxPropertyData {
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


class MapChunksGrid extends Grid {

  /*
  public position(index: number, out?: Vec2): Vec2 {
    const position = super.position(index, out);

    position.x -= (this.width >> 1) - (this.cellWidth >> 1);
    position.y -= (this.height >> 1) - (this.cellHeight >> 1);

    return position;
  }
   */

}

export class TmxMap extends TilesetBag<Tileset> {

  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[],
    public readonly layers: Layer[],
    public readonly tileWidth: number,
    public readonly tileHeight: number
  ) {
    super(tilesets);
  }

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

  if (!data.infinite) {
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

/** @internal */
function verify(data: TmxTilemapData): void {
  // Check if we've got the right TMX format.
  if (data.type !== 'map') {
    throw new Error('Data is not a TMX tilemap.');
  }
}

/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxTilemapData, TmxMap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /**
   * Creates a `Tilemap` from `data`.
   *
   * Todo: Infinite maps
   */
  public async process(data: TmxTilemapData, file: string, loader: AssetLoader): Promise<TmxMap> {
    // Make sure that the map data we've got is not corrupted.
    verify(data);

    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(data.tilesets.map(
      item => processTileset(loader, getDirectory(file), item)
    ));

    const layers: Layer[] = [];

    for (const layerData of data.layers) {
      switch (layerData.type) {
        case TmxLayerDataType.Tiles:
          layers.push(tmxParseTileLayer(layerData));
          break;
        case TmxLayerDataType.Objects:
          layers.push(tmxParseObjectLayer(layerData));
          break;
      }
    }

    return new TmxMap(
      new Grid(
        data.width,
        data.height,
        data.tilewidth,
        data.tileheight
      ),
      tilesets,
      layers,
      data.tilewidth,
      data.tileheight
    );
  }

}