import { TmxLayer } from './layer';
import { TmxTileset } from './tileset';
import { TmxHasProperties } from './utils';


/** An external tileset that must be loaded manually. */
export interface TmxExternalLocalTilesetData {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
export interface TmxEmbeddedLocalTilesetData extends TmxTileset {
  firstgid: number;
}

export type TmxLocalTilesetData = TmxExternalLocalTilesetData | TmxEmbeddedLocalTilesetData;

export interface TmxEditorSettings {
  chunksize?: {
    height: number;
    width: number;
  }
}

export interface TmxTilemap extends TmxHasProperties {
  backgroundcolor: string;
  editorsettings?: TmxEditorSettings;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayer[];
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
