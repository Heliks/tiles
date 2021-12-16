import { TmxHasProperties } from '../properties';
import { TmxShape } from '../shape';


export enum TmxLayerType {
  Objects = 'objectgroup',
  Tiles = 'tilelayer'
}

/** @interface */
interface TmxBaseLayer extends TmxHasProperties {
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
interface TmxInfiniteTileLayer extends TmxBaseLayer {
  chunks: TmxChunk[];
  data: undefined;
  type: TmxLayerType.Tiles;
}

/** @internal */
interface TmxFixedTileLayer extends TmxBaseLayer {
  chunks: undefined;
  data: number[];
  type: TmxLayerType.Tiles;
}

/** A layer containing tiles arranged in a grid. */
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

interface TmxTilemapTile extends TmxHasProperties {
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
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tiles?: TmxTilemapTile[];
  type: 'tileset';
}

/** An external tileset that must be loaded manually. */
export interface TmxExternalTilemapTileset {
  firstgid: number;
  source: string;
}

/** Tileset that is directly embedded into the map data. */
export interface TmxEmbeddedTilemapTileset extends TmxTileset {
  firstgid: number;
}

/** @internal */
export type TmxTilemapTileset = TmxExternalTilemapTileset | TmxEmbeddedTilemapTileset;

export interface TmxEditorSettings {
  chunksize?: {
    height: number;
    width: number;
  }
}

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#map */
export interface TmxTilemap extends TmxHasProperties {
  backgroundcolor: string;
  editorsettings?: TmxEditorSettings;
  height: number;
  hexsidelength: number;
  infinite: boolean;
  layers: TmxLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  tiledversion: string;
  tileheight: number;
  tilesets: TmxTilemapTileset[];
  tilewidth: number;
  type: 'map';
  width: number;
}

