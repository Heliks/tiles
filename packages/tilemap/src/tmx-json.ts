export type TmxOrientation = 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

/** @see https://doc.mapeditor.org/en/stable/reference/json-map-format/#tileset */
export interface TmxTileset {
  backgroundcolor: string;
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  properties: any[];
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
  x: number;
  y: number;
}

export interface TmxTileLayer extends BaseLayer {
  data: number[];
  type: 'tilelayer';
}

export type TmxLayer = TmxTileLayer;

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
  properties: any[];
  tiledversion: string;
  tileheight: number;
  // Todo: Tiled also supports inline tilesets.
  tilesets: TmxExternalTileset[];
  tilewidth: number;
  type: 'map';
  width: number;
}
