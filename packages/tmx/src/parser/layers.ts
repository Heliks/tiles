import { GameObject, Tile, TmxObjectData, tmxParseObject } from './objects';
import { HasTmxPropertyData, tmxExtractProperties, Properties, HasProperties } from './properties';
import { Shape, tmxParseShape } from './shape';
import { MaterialId } from '@heliks/tiles-physics';
import { Grid, Vec2 } from '@heliks/tiles-math';

export enum TmxLayerType {
  Objects = 'objectgroup',
  Tiles = 'tilelayer',
  Group = 'group'
}

export enum LayerType {
  Tiles,
  Objects
}

/** @internal */
interface TmxBaseLayer extends HasTmxPropertyData {
  width: number;
  height: number;
  name: string;
  offsetx: number;
  offsety: number;
  opacity: number;
  x: number;
  y: number;
}

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
interface TmxFixedWidthTileLayer extends TmxBaseLayer {
  chunks: undefined;
  data: number[];
  type: TmxLayerType.Tiles;
}

/** A layer containing tiles arranged in a grid. */
export type TmxTileLayerData = TmxFixedWidthTileLayer | TmxInfiniteTileLayer;


export class Chunk<D> {

  constructor(
    public readonly data: D,
    public readonly grid: Grid
  ) {}

}

abstract class BaseLayer<D, P extends Properties = Properties> implements HasProperties<P> {

  // public readonly chunks: Chunks<D>;
  public abstract readonly type: LayerType;
  private readonly chunks = new Map<number, Chunk<D>>();

  constructor(
    public readonly name: string,
    public readonly properties: P
  ) {}

  public setChunkAt(index: number, data: Chunk<D>): this {
    this.chunks.set(index, data);

    return this;
  }

  public getChunkAt(index: number): Chunk<D> {
    const chunk = this.chunks.get(index);

    if (! chunk) {
      throw new Error(`No chunk at index ${index}`);
    }

    return chunk;
  }

  public hasChunkAt(index: number): boolean {
    return this.chunks.has(index);
  }
}

export class TileLayer extends BaseLayer<number[]> {
  public readonly type =  LayerType.Tiles;
}

/**
 * Parses a tile layer.
 */
export function tmxParseTileLayer(data: TmxTileLayerData, tileSize: Vec2, chunks: Grid, tiles: Grid): TileLayer {
  const layer = new TileLayer(data.name, tmxExtractProperties(data));

  if (data.chunks) {
    for (const chunk of data.chunks) {
      layer.setChunkAt(chunks.index(chunk.x, chunk.y), new Chunk(
        chunk.data,
        tiles
      ));
    }
  }
  else {
    // Push the whole layer as a single chunk. We could do this manually too and force
    // chunking of the data structure, but if the user does not use infinite maps in
    // tiled we just assume that chunking should be disabled.
    layer.setChunkAt(0, new Chunk(data.data, tiles));
  }

  return layer;
}

export class ObjectLayer extends BaseLayer<GameObject[]> {
  public readonly type =  LayerType.Objects;
}

export function tmxParseObjectLayer(data: TmxObjectLayerData, tileSize: Vec2, chunks: Grid, tiles: Grid): ObjectLayer {
  const layer = new ObjectLayer(data.name, tmxExtractProperties(data));

  for (const item of data.objects) {
    // Object is a tile
    if (item.gid) {
      const object = tmxParseObject(item);

      // Get the chunk on which we should place the object. The chunk grid is measured
      // in units specified by the maps tile size so we need to convert the objects
      // position first.
      const chunkIdx = chunks.index(
        object.data.x / tiles.cellWidth,
        object.data.y / tiles.cellHeight
      );

      console.log('found chunk', item.id, chunkIdx)

      const chunkPos = chunks.position(chunkIdx);

      // Re-calculate the position of the object to be relative to the chunk on which
      // it is placed rather than the map itself.
      object.data.x -= (chunkPos.x * tiles.cellWidth);
      object.data.y -= (chunkPos.y * tiles.cellHeight);

      let chunk;

      if (layer.hasChunkAt(chunkIdx)) {
        chunk = layer.getChunkAt(chunkIdx);
      }
      else {
        chunk = new Chunk([], tiles);
        layer.setChunkAt(chunkIdx, chunk);
      }

      chunk.data.push(object);
    }
  }

  console.log(layer);

  return layer;
}

export type Layer = TileLayer | ObjectLayer;




/** JSON format for object layers. */
export interface TmxObjectLayerData extends TmxBaseLayer {
  objects: TmxObjectData[];
  type: TmxLayerType.Objects;
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
  data: GameObject[];
  shapes: Shape<unknown>[];
  type: LayerType.Objects;
}

/** JSON format for layer groups. */
export interface TmxGroupLayerData extends TmxBaseLayer {
  layers: (TmxGroupLayerData | TmxObjectLayerData | TmxTileLayerData)[];
  type: TmxLayerType.Group;
}

export type TmxLayer = TmxObjectLayer;
export type TmxLayerData = TmxTileLayerData | TmxObjectLayerData | TmxGroupLayerData;

/** @internal */
/*
function parseObjectLayer(data: TmxObjectLayerData) {
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
    properties: tmxExtractProperties(data),
    shapes: shapes as any,
    type: LayerType.Objects
  };
}
 */


