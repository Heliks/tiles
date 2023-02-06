import { TmxLayerData } from './layer';
import { TmxTilesetData } from './tileset';
import { TmxHasPropertyData } from './utils';


/** An external tileset that must be loaded manually. */
export interface TmxExternalLocalTilesetData {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
export interface TmxEmbeddedLocalTilesetData extends TmxTilesetData {
  firstgid: number;
}

export type TmxLocalTilesetData = TmxExternalLocalTilesetData | TmxEmbeddedLocalTilesetData;

export interface TmxEditorSettingsData {
  chunksize?: {
    height: number;
    width: number;
  }
}

export interface TmxTilemapData extends TmxHasPropertyData {
  backgroundcolor: string;
  editorsettings?: TmxEditorSettingsData;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayerData[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  tiledversion: string;
  tileheight: number;
  tilesets: TmxLocalTilesetData[];
  tilewidth: number;
  type: 'map';
  width: number;
}


/** @internal */
export function isLocalTilesetExternal(data: TmxLocalTilesetData): data is TmxExternalLocalTilesetData {
  return Boolean((data as TmxExternalLocalTilesetData).source);
}
