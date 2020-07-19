export type TmxOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

export interface TmxProperty {
  name: string;
  value: string;
  type: 'bool' | 'float' | 'int' | 'string';
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTileset {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  properties?: TmxProperty[];
  source: string;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  type: 'tileset';
}

interface BaseLayer {
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
  properties?: TmxProperty[];
  x: number;
  y: number;
}

export interface TmxObject {
  gid: number;
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

export enum TmxLayerType {
  Objects = 'objectgroup',
  Tiles = 'tilelayer',
  Group = 'group'
}

export interface TmxObjectLayer extends BaseLayer {
  objects: TmxObject[];
  type: TmxLayerType.Objects;
}

export interface TmxTileLayer extends BaseLayer {
  data: number[];
  type: TmxLayerType.Tiles;
}

export interface TmxGroupLayer extends BaseLayer {
  layers: (
    TmxGroupLayer | TmxObjectLayer | TmxTileLayer
  )[];
  type: TmxLayerType.Group;
}

export type TmxLayer = TmxObjectLayer | TmxTileLayer | TmxGroupLayer;

/** An external tileset that must be loaded before it can be used. */
export interface TmxExternalTileset {
  /** The Id of the first tile in the tile set. */
  firstgid: number;
  /** The source file of the tileset that should be loaded. */
  source: string;
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxTilemap {
  backgroundcolor: string;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: TmxOrientation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any[];
  tiledversion: string;
  tileheight: number;
  // Todo: Tiled also supports inline tilesets.
  tilesets: TmxExternalTileset[];
  tilewidth: number;
  type: 'map';
  width: number;
}
