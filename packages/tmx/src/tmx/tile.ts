import { TmxHasPropertyData } from './utils';
import { TmxGeometryData } from './geometry';
import { TmxObjectData } from './layer';


export interface TmxTileAnimationFrame {
  duration: number;
  tileid: number;
}

export interface TmxTileData extends TmxObjectData, TmxHasPropertyData {
  animation?: TmxTileAnimationFrame[];
  /** Note: This is actually the tile index, not the ID. */
  id: number;
  objectgroup?: {
    objects: TmxGeometryData[]
  }
}
