export type TmxOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

export interface TmxProperty {
  name: string;
  value: string | number;
  type: 'bool' | 'float' | 'int' | 'string';
}

export interface TmxHasProperty {
  properties?: TmxProperty[];
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTilesetData extends TmxHasProperty {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  name: string;
  margin: number;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  type: 'tileset';
}

interface BaseLayer extends TmxHasProperty {
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
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

/** An external tileset that must be loaded manually. */
export interface TmxExternalTileset {
  firstgid: number;
  source: string;
}

/** A tileset that is embedded directly into the map. */
export interface TmxInlineTileset extends TmxTilesetData {
  firstgid: number;
  source: undefined;
}

export type TmxTileset = TmxExternalTileset | TmxInlineTileset;

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxTilemap extends TmxHasProperty {
  backgroundcolor: string;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: TmxOrientation;
  tiledversion: string;
  tileheight: number;
  // Todo: Tiled also supports inline tilesets.
  tilesets: TmxTileset[];
  tilewidth: number;
  type: 'map';
  width: number;
}
