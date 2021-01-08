import { Tile, TmxObjectData, tmxParseObject } from './objects';
import { HasTmxPropertyData, tmxParseProperties, TmxProperties } from './properties';
import { Shape, tmxParseShape } from './shape';
import { MaterialId } from '@heliks/tiles-physics';

export enum LayerTypeData {
  Objects = 'objectgroup',
  Tiles = 'tilelayer',
  Group = 'group'
}

export enum LayerType {
  Tiles,
  Objects
}

/** @internal */
interface BaseLayer<P = TmxProperties> {
  /** The layers name. This is mainly for debugging purposes. */
  name: string;
  /** Layer type. */
  type: LayerType;
  /** Custom properties. */
  properties: P;
}

/** @internal */
interface BaseLayerData extends HasTmxPropertyData {
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
  x: number;
  y: number;
}

/** JSON format for tile layers. */
export interface TmxTileLayerData extends BaseLayerData {
  data: number[];
  type: LayerTypeData.Tiles;
}

/** A layer containing tiles arranged in a grid. */
export interface TmxTileLayer extends BaseLayer {
  data: number[];
  type: LayerType.Tiles;
}

/** JSON format for object layers. */
export interface TmxObjectLayerData extends BaseLayerData {
  objects: TmxObjectData[];
  type: LayerTypeData.Objects;
}

/** Properties for object layers. */
export interface ObjectLayerProperties {
  /**
   * If set to `true` the layer will be considered a floor. Floors are special layers
   * for pawns and other movable entities as they are placed into a depth-sorted
   * render node.
   */
  isFloor?: boolean;
}

/** A layer containing free-positioned objects. */
export interface TmxObjectLayer extends BaseLayer<ObjectLayerProperties> {
  data: Tile[];
  shapes: Shape<unknown, unknown>[];
  type: LayerType.Objects;
}

/** JSON format for layer groups. */
export interface TmxGroupLayerData extends BaseLayerData {
  layers: (TmxGroupLayerData | TmxObjectLayerData | TmxTileLayerData)[];
  type: LayerTypeData.Group;
}

export type TmxLayer = TmxTileLayer | TmxObjectLayer;
export type TmxLayerData = TmxTileLayerData | TmxObjectLayerData | TmxGroupLayerData;

/** @internal */
function parseObjectLayer(data: TmxObjectLayerData): TmxObjectLayer {
  const objects = [];
  const shapes = [];

  for (const item of data.objects) {
    // Object is a tile
    if (item.gid) {
      objects.push(tmxParseObject(item));
    }
    else {
      shapes.push(tmxParseShape(item, 0, 0))
    }
  }

  return {
    data: objects,
    name: data.name,
    properties: tmxParseProperties(data),
    shapes: shapes as any,
    type: LayerType.Objects
  };
}

/**
 * Parses TMX layer `data` and pushes the result into `out`. Parsing a single data set
 * may result in multiple layers (a.E.: layer groups).
 */
export function tmxParseLayer(data: TmxLayerData, out: TmxLayer[] = []): TmxLayer[] {
  switch (data.type) {
    case LayerTypeData.Tiles:
      out.push({
        data: data.data,
        name: data.name,
        properties: tmxParseProperties(data),
        type: LayerType.Tiles
      });

      break;
    case LayerTypeData.Group:
      // Parse each child recursively.
      for (const item of data.layers) {
        tmxParseLayer(item, out);
      }

      break;
    case LayerTypeData.Objects:
      out.push(parseObjectLayer(data));

      break;
    default:
      throw new Error('Unknown layer type');
  }

  return out;
}

