import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { TilesetBag } from '@heliks/tiles-tilemap';
import { Tileset, TmxTilesetData as TilesetBaseData, TmxTilesetFormat } from './tileset';
import { Grid } from '@heliks/tiles-engine';
import { TmxLayer, TmxLayerData, tmxParseLayer } from './layers';
import { HasTmxPropertyData } from './properties';

/** An external tileset that must be loaded manually. */
interface ExternalTileset extends TilesetBaseData {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
interface InternalTileset extends TilesetBaseData {
  firstgid: number;
  source: undefined;
}

type TilemapTilesetData = ExternalTileset | InternalTileset;

/** @internal */
function isExternalTileset(data: TilemapTilesetData): data is ExternalTileset {
  return data.source !== undefined;
}

/** @internal */
async function processTileset(loader: AssetLoader, basePath: string, data: TilemapTilesetData): Promise<Tileset> {
  const format = new TmxTilesetFormat(data.firstgid);

  // If the given data is an external tileset we load it using the loader. Otherwise
  // we can simply parse it directly.
  return isExternalTileset(data)
    ? loader.fetch(`${basePath}/${data.source}`, format)
    : format.process(data, '', loader);
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxMapData extends HasTmxPropertyData {
  backgroundcolor: string;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayerData[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  tiledversion: string;
  tileheight: number;
  tilesets: TilemapTilesetData[];
  tilewidth: number;
  type: 'map';
  width: number;
}

export class TmxMap extends TilesetBag<Tileset> {

  constructor(
    public readonly grid: Grid,
    public readonly tilesets: Tileset[],
    public readonly layers: TmxLayer[]
  ) {
    super(tilesets);
  }

}

/** @internal */
function verify(data: TmxMapData): void {
  // Check if we've got the right TMX format.
  if (data.type !== 'map') {
    throw new Error('Data is not a TMX tilemap.');
  }

  // Infinite maps are not supported as of now.
  if (data.infinite) {
    throw new Error('Infinite maps are not supported.');
  }
}

/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxMapData, TmxMap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /**
   * Creates a `Tilemap` from `data`.
   *
   * Todo: Infinite maps
   */
  public async process(data: TmxMapData, file: string, loader: AssetLoader): Promise<TmxMap> {
    // Make sure that the map data we've got is not corrupted.
    verify(data);

    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(data.tilesets.map(
      item => processTileset(loader, getDirectory(file), item)
    ));

    const grid = new Grid(
      data.width,
      data.height,
      data.tilewidth,
      data.tileheight
    );

    const layers: TmxLayer[] = [];

    for (const item of data.layers) {
      tmxParseLayer(item, layers);
    }

    return new TmxMap(grid, tilesets, layers);
  }

}
