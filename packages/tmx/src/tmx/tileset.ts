
import { TmxShape } from './shape';
import { TmxHasProperties } from './utils';


export enum TmxTilesetObjectAlignment {
  Right = 'right',
  Left = 'left',
  Center = 'center',
  Top = 'top',
  TopLeft = 'topleft',
  TopRight = 'topright',
  Bottom = 'bottom',
  BottomLeft = 'bottomleft',
  BottomRight = 'bottomright'
}

export interface TmxTilemapTile extends TmxHasProperties {
  animation?: {
    duration: number;
    tileid: number;
  }[];
  id: number;
  objectgroup?: {
    objects: TmxShape[]
  }
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTileset extends TmxHasProperties {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  spacing: number;
  objectalignment?: TmxTilesetObjectAlignment;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tiles?: TmxTilemapTile[];
  type: 'tileset';
}
