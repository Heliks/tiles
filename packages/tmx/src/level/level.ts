import { Entity, Grid, Rectangle } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { LocalTilesetBag } from '@heliks/tiles-tilemap';
import { LevelEntity } from './entities';
import { TmxTileset } from './tmx-tileset';


/** Available types of chunk layers. */
export enum ChunkLayerType {
  Tiles,
  Entities
}

/** Default properties for chunk layers that are used by the level system. */
export interface ChunkLayerProps {
  /** Defines the renderer layer where this Tiled layer should be rendered. */
  $layer?: LayerId;
  /** If enabled, this layer will be treated as a meta-layer. */
  $meta?: boolean;
}

interface BaseLayer<P extends ChunkLayerProps = ChunkLayerProps> {
  /** Custom properties. */
  props: P;
  name: string;
}

/**
 * This layer type stores an array of tile IDs that define which tiles are placed
 * in the chunk's grid. Each number in the `data` array corresponds to a specific
 * tile in one of the tileset present on the tilemap.
 *
 * @template `P`: Custom properties.
 */
export interface ChunkTileLayer<P extends ChunkLayerProps = ChunkLayerProps> extends BaseLayer<P> {
  data: number[];
  type: ChunkLayerType.Tiles;
}

/**
 * This layer type contains objects (such as shapes, entities) that are spawned
 * with this chunk. 
 *
 * During gameplay, entities may leave the boundaries of this chunk, and therefore,
 * the entities that are spawned and de-spawned when the chunk is unloaded may be
 * different.
 *
 * @template `P`: Custom properties.
 */
export interface ChunkEntityLayer<P extends ChunkLayerProps = ChunkLayerProps> extends BaseLayer<P> {
  data: LevelEntity[];
  type: ChunkLayerType.Entities;
}

/**
 * @template `P`: Custom properties.
 */
export type ChunkLayer<P extends ChunkLayerProps = ChunkLayerProps> = ChunkTileLayer<P> | ChunkEntityLayer<P>;

export enum ChunkState {
  /** Chunk is waiting to be loaded. */
  Pending,
  /** Chunk is in the process of being loaded. */
  Loading,
  /** Chunk is fully loaded. */
  Loaded
}

/**
 * Key-value map that stores the meta-layers of a chunk.
 * @see Chunk.meta
 */
export interface ChunkMetaLayers<L = ChunkLayer> {
  [name: string]: L;
}

/**
 * @template L - The type of layer associated with the chunk.
 */
export interface Chunk<L = ChunkLayer, M = ChunkMetaLayers> {
  /** Defines the chunks' outer boundaries in world units.*/
  bounds: Rectangle;
  /** When the chunk is loaded, this will contain the root entity. */
  entity?: Entity;
  /**
   * Contains all entities in this chunk that will be destroyed when the chunk is
   * culled. This list is managed automatically by the level system.
   */
  entities: Entity[];
  /**
   * Defines how tiles are arranged in this chunk.
   *
   * Columns and rows define the number of tiles in each direction. The cell size
   * defines the size of each tile.
   */
  grid: Grid;
  /** Grid index of this chunk. */
  index: number;
  /**
   * Meta-layers are special layers that typically contain game-specific information
   * like collision data, terrain types, etc. They are ignored by the level system
   * and must therefore be handled by each game individually.
   */
  meta: M;
  /** Layers to render this chunk. */
  layers: L[];
  /** Current loading state of the chunk. */
  state: ChunkState;
  /** Grid location of this chunk along the x-axis. */
  x: number;
  /** Grid location of this chunk along the y-axis. */
  y: number;
}

/**
 * Component that spawns a level.
 *
 * Levels render {@link MapAsset map assets}.
 *
 * @template `P`: Custom properties.
 * @template `T`: Tilesets that are used by this level.
 */
export class Level<P = {}, T extends TmxTileset = TmxTileset> {

  /**
   * Index of the chunk from where the levels' render distance is measured. Chunks
   * within that distance will be loaded. Chunks that are outside will be unloaded
   * if needed.
   */
  public chunk = -1;

  /**
   * Index of the chunk from where the currently loaded chunks of the level were
   * measured. If this is not equal to {@link chunk}, the level will start loading
   * or unloading chunks as needed.
   */
  public _chunk = -1

  /**
   * Contains the individual chunks of the map. If the map is finite, it will contain
   * a single chunk that covers the entire map.
   */
  public readonly chunks: Chunk[] = [];

  /** Contains all chunks that are currently loaded. */
  public readonly loaded = new Set<Chunk>();

  /** Contains the tilesets with which tiles, objects etc. are rendered on this map. */
  public readonly tilesets = new LocalTilesetBag<T>();

  /**
   * @param grid Grid that defines the dimensions of the entire tilemap. The cell size
   *  defines the size of an individual tile. Columns and rows how many tiles there are
   *  in total in each direction.
   * @param layout Grid that defines the layout of individual map chunks. Columns and
   *  rows determine the number of chunks in each direction. The cell size determines
   *  the number of tiles contained in each chunk.
   * @param props Custom properties.
   */
  constructor(
    public readonly grid: Grid,
    public readonly layout: Grid,
    public readonly props: P
  ) {}

  /**
   * Returns the chunk that occupies the given cell `index` on the map's chunk
   * {@link layout}, or `undefined` if there's no chunk at that location.
   */
  public getChunk(index: number): Chunk | undefined {
    return this.chunks.find(chunk => chunk.index === index);
  }

}
