import { TmxHasPropertyData } from './utils';
import { TmxShapeData } from './shape';
import { TmxObjectData } from './layer';


export interface TmxTileData extends TmxObjectData, TmxHasPropertyData {
  animation?: {
    duration: number;
    tileid: number;
  }[];
  /** Note: This is actually the tile index, not the ID. */
  id: number;
  objectgroup?: {
    objects: TmxShapeData[]
  }
}
