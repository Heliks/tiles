import { TmxGeometryData } from './geometry';
import { TmxHasPropertyData } from './utils';


export enum TmxLayerTypeData {
  Objects = 'objectgroup',
  Tiles = 'tilelayer',
  Group = 'group',
  Image = 'image'
}

interface TmxBaseLayerData extends TmxHasPropertyData {
  class?: string;
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
  visible: boolean;
  x: number;
  y: number;
}

export interface TmxChunkData {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface TmxInfiniteTileLayerData extends TmxBaseLayerData {
  chunks: TmxChunkData[];
  data: undefined;
  type: TmxLayerTypeData.Tiles;
}

export interface TmxFiniteTileLayerData extends TmxBaseLayerData {
  data: number[];
  type: TmxLayerTypeData.Tiles;
}

export type TmxTileLayerData = TmxFiniteTileLayerData | TmxInfiniteTileLayerData;

export interface TmxObjectData extends TmxGeometryData, TmxHasPropertyData {
  gid?: number;
}

/** JSON format for object layers. */
export interface TmxObjectLayerData extends TmxBaseLayerData {
  objects: TmxObjectData[];
  type: TmxLayerTypeData.Objects;
}

export interface TmxGroupLayerData<L extends TmxBaseLayerData> extends TmxBaseLayerData {
  layers: L[];
  type: TmxLayerTypeData.Group;
}

export type TmxLayerData = TmxTileLayerData | TmxObjectLayerData | TmxGroupLayerData<TmxLayerData>;
