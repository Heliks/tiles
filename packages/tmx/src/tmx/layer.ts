import { TmxHasPropertyData } from './utils';


export enum TmxLayerTypeData {
  Objects = 'objectgroup',
  Tiles = 'tilelayer',
  Group = 'group',
  Image = 'image'
}

interface TmxBaseLayerData extends TmxHasPropertyData {
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

interface TmxChunkData {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

interface TmxInfiniteTileLayerData extends TmxBaseLayerData {
  chunks: TmxChunkData[];
  data: undefined;
  type: TmxLayerTypeData.Tiles;
}

interface TmxFiniteTileLayerData extends TmxBaseLayerData {
  chunks: undefined;
  data: number[];
  type: TmxLayerTypeData.Tiles;
}

export type TmxTileLayerData = TmxFiniteTileLayerData | TmxInfiniteTileLayerData;

export interface TmxObjectData extends TmxHasPropertyData {
  gid?: number;
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
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
