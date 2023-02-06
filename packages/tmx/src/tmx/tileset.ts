import { TmxHasPropertyData } from './utils';
import { TmxTileData } from './tile';


export enum TmxTilesetAlignData {
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

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTileset extends TmxHasPropertyData {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  spacing: number;
  objectalignment?: TmxTilesetAlignData;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tiles?: TmxTileData[];
  type: 'tileset';
}
