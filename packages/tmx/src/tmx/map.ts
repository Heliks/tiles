import { TmxFiniteTileLayerData, TmxGroupLayerData, TmxInfiniteTileLayerData, TmxObjectLayerData } from './layer';
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

/** Available map layers on finite maps. */
export type TmxFiniteMapDataLayers =
  TmxFiniteTileLayerData |
  TmxObjectLayerData |
  TmxGroupLayerData<TmxFiniteMapDataLayers>;

/** Available map layers on infinite maps. */
export type TmxInfiniteMapDataLayers =
  TmxInfiniteTileLayerData |
  TmxObjectLayerData |
  TmxGroupLayerData<TmxInfiniteMapDataLayers>;

/** @internal */
interface TmxBaseMap extends TmxHasPropertyData {
  backgroundcolor?: string;
  editorsettings?: TmxEditorSettingsData;
  height: number;
  tileheight: number;
  tilesets: TmxLocalTilesetData[];
  tilewidth: number;
  width: number;
}

/** Data for tilemaps with a fixed (finite) size. */
export interface TmxFiniteMap extends TmxBaseMap {
  infinite: false;
  layers: TmxFiniteMapDataLayers[];
}

/** Data for tilemaps that are infinite. */
export interface TmxInfiniteMap extends TmxBaseMap {
  infinite: true;
  layers: TmxInfiniteMapDataLayers[];
}

/** Data for tilemaps. */
export type TmxMapData = TmxFiniteMap | TmxInfiniteMap;

/** @internal */
export function isLocalTilesetExternal(data: TmxLocalTilesetData): data is TmxExternalLocalTilesetData {
  return Boolean((data as TmxExternalLocalTilesetData).source);
}
