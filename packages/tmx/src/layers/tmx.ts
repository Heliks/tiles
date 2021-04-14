import { HasTmxPropertyData } from '../properties';
import { TmxObjectData } from '../objects';

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

/** JSON format for object layers. */
export interface TmxObjectLayerData extends TmxBaseLayerData {
  objects: TmxObjectData[];
  type: TmxLayerDataType.Objects;
}

export type TmxLayerData = TmxTileLayerData | TmxObjectLayerData;

