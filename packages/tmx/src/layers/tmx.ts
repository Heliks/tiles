import { HasTmxPropertyData } from '../properties';

export enum TmxLayerDataType {
  Objects = 'objectgroup',
  Tiles = 'tilelayer'
}

/** @interface */
interface TmxBaseLayerData extends HasTmxPropertyData {
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
  x: number;
  y: number;
}

/** @internal */
interface TmxChunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

/** @internal */
interface TmxInfiniteTileLayerData extends TmxBaseLayerData {
  chunks: TmxChunk[];
  data: undefined;
  type: TmxLayerDataType.Tiles;
}

/** @internal */
interface TmxFixedSizeTileLayerData extends TmxBaseLayerData {
  chunks: undefined;
  data: number[];
  type: TmxLayerDataType.Tiles;
}

/** A layer containing tiles arranged in a grid. */
export type TmxTileLayerData =
  TmxFixedSizeTileLayerData |
  TmxInfiniteTileLayerData;


export interface TmxObject extends HasTmxPropertyData {
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
  objects: TmxObject[];
  type: TmxLayerDataType.Objects;
}

export type TmxLayerData = TmxTileLayerData | TmxObjectLayerData;

