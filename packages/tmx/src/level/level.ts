import { Grid } from '@heliks/tiles-engine';
import { LocalTilesetBag, Tileset } from '@heliks/tiles-tilemap';


/** Available types of chunk layers. */
export enum MapAssetChunkLayerType {
  Tiles,
  Entities
}

export interface ChunkTileLayer<P = unknown> {
  data: number[];
  type: MapAssetChunkLayerType
  props: P;
}

export type MapAssetChunkLayer = ChunkTileLayer;

export enum ChunkState {
  /** Chunk is waiting to be loaded. */
  Pending,
  /** Chunk is in the process of being loaded. */
  Loading,
  /** Chunk is fully loaded. */
  Loaded
}

/**
 * @template L - The type of layer associated with the chunk.
 */
export interface Chunk<L = MapAssetChunkLayer> {
  /** Grid index of this chunk. */
  index: number;
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
export class Level<P = unknown, T extends Tileset = Tileset> {

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

  public getChunk(index: number): Chunk | undefined {
    return this.chunks.find(chunk => chunk.index === index);
  }

}
