import { TmxHasProperties } from './utils';


export enum TmxLayerType {
  Objects = 'objectgroup',
  Tiles = 'tilelayer'
}

interface TmxBaseLayer extends TmxHasProperties {
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

interface TmxChunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

interface TmxInfiniteTileLayer extends TmxBaseLayer {
  chunks: TmxChunk[];
  data: undefined;
  type: TmxLayerType.Tiles;
}

interface TmxFixedTileLayer extends TmxBaseLayer {
  chunks: undefined;
  data: number[];
  type: TmxLayerType.Tiles;
}

export type TmxTileLayer =
  TmxFixedTileLayer |
  TmxInfiniteTileLayer;

export interface TmxObject extends TmxHasProperties {
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
export interface TmxObjectLayer extends TmxBaseLayer {
  objects: TmxObject[];
  type: TmxLayerType.Objects;
}

export type TmxLayer = TmxTileLayer | TmxObjectLayer;
