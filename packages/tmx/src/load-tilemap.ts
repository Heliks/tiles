import { AssetLoader, Format, getDirectory, LoadType } from '@heliks/tiles-assets';
import { Grid } from '@heliks/tiles-math';
import { TmxLayerData } from './layers';
import { LoadTileset, TilesetFormat } from './load-tileset';
import { HasPropertiesFormat } from './properties';
import { Tilemap } from './tilemap';
import { Tileset } from './tileset';


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

/** Asset loader format for loading TMX tilemaps. */
export class TmxTilemapFormat implements Format<TmxTilemapData, Tilemap> {

  /** @inheritDoc */
  public readonly name = 'tmx-tilemap';

  /** @inheritDoc */
  public readonly type = LoadType.Json;

  /** @inheritDoc */
  public async process(data: TmxTilemapData, file: string, loader: AssetLoader): Promise<Tilemap> {
    // Load all tilesets on the tile map.
    const tilesets = await Promise.all(
      data.tilesets.map(item => processTileset(
        loader,
        getDirectory(file),
        item
      ))
    );

    return new Tilemap(
      new Grid(
        data.width,
        data.height,
        data.tilewidth,
        data.tileheight
      ),
      tilesets
    );
  }

}