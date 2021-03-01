import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { TilesetBag } from '@heliks/tiles-tilemap';
import { Tileset, TmxTilesetData as TilesetBaseData, TmxTilesetFormat } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { Layer, TmxLayerData, TmxLayerType, tmxParseObjectLayer, tmxParseTileLayer } from './layers';
import { HasTmxPropertyData } from './properties';
import { Vec2, vec2 } from '@heliks/tiles-math';

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
    public readonly chunks: Grid,
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

/** @internal */
function createMapChunksGrid(data: TmxTilemapData): Grid {
  let cw = TMX_DEFAULT_CHUNK_SIZE;
  let ch = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    cw = data.editorsettings.chunksize.width;
    ch = data.editorsettings.chunksize.height;
  }

  return new MapChunksGrid(
    data.width / cw,
    data.height / ch,
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

    const tileSize = vec2(data.tilewidth, data.tileheight);
    const tileGrid = new Grid(data.width, data.height, data.tilewidth, data.tileheight);

    // Grid for aligning chunks. This is not layer but map specific because we manually
    // chunk layers without native tiled chunking support.
    const mapChunksGrid = createMapChunksGrid(data);

    // Grid for placing tiles tiles withing a chunk. This will be used for all chunks
    // that exist on this map.
    const chunkTileGrid = new Grid(
      mapChunksGrid.cellWidth,
      mapChunksGrid.cellHeight,
      data.tilewidth,
      data.tileheight
    );

    console.log(mapChunksGrid);
    console.log(chunkTileGrid);

    const layers: Layer[] = [];

    for (const item of data.layers) {
      switch (item.type) {
        case TmxLayerType.Tiles:
          layers.push(tmxParseTileLayer(item, tileSize, mapChunksGrid, chunkTileGrid));
          break;
        case TmxLayerType.Objects:
          layers.push(tmxParseObjectLayer(item, tileSize, mapChunksGrid, chunkTileGrid));
          break;
      }

      /*
      if (item.type === TmxLayerType.Tiles) {
        layers.push(tmxParseTileLayer(item, tileSize, chunkTileGrid));
      }
      else  {
        layers.push(tmxParseObjectLayer(item, tileSize, mapChunksGrid));
      }
       */
      // tmxParseLayer(item, layers);
    }

    return new TmxMap(mapChunksGrid, tilesets, layers, data.tilewidth, data.tileheight);
  }

}
