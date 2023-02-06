import { TmxHasPropertyData } from './utils';
import { TmxShapeData } from './shape';


export interface TmxTileData extends TmxHasPropertyData {
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
