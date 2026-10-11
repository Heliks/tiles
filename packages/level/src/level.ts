import { Entity, EventQueue, Grid, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { LocalTilesetBag } from '@heliks/tiles-tilemap';
import { Layer, LayerDataMap } from './layers';
import { Tileset } from './tileset';


export enum ChunkState {
  /** Chunk is waiting to be loaded. */
  Pending,
  /** Chunk is in the process of being loaded. */
  Loading,
  /** Chunk is fully loaded. */
  Loaded
}

export interface Chunk {
  /** Defines the chunks' outer boundaries in world units.*/
  bounds: Rectangle;
  /** When the chunk is loaded, this will contain the root entity. */
  entity?: Entity;
  /** If set to `true`, the chunk will be re-rendered. */
  dirty?: boolean;
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
   * Chunk-local data for {@link LevelLayer level layers} mapped to the ID of the layer
   * to which it belongs.
   *
   * A chunk may not store data for every layer. The order of entries is not guaranteed
   * to be stable. The canonical layer order is defined by {@link Level.layers}.
   */
  layers: LayerDataMap;
  /** Current loading state of the chunk. */
  state: ChunkState;
  /** Grid location of this chunk along the x-axis. */
  x: number;
  /** Grid location of this chunk along the y-axis. */
  y: number;
}


export enum LevelEventType {
  /** Event that is emitted when a chunk has been successfully loaded. */
  ChunkLoaded,
  /** Event that is emitted when a chunk has been successfully unloaded. */
  ChunkUnloaded
}

export interface LevelChunkEvent {
  type: LevelEventType.ChunkLoaded | LevelEventType.ChunkUnloaded;
  chunk: Chunk;
}

export type LevelEvent = LevelChunkEvent;


/** @internal */
const SCRATCH_GRID = new Grid(0, 0, 0, 0);

/** @internal */
const SCRATCH_VEC2 = new Vec2();

/**
 * Component that spawns a level.
 *
 * @template `P`: Custom properties.
 * @template `T`: Tilesets that are used by this level.
 */
export class Level<P = {}, T extends Tileset = Tileset> {

  /**
   * The background color of the level, represented as a hexadecimal number. If defined,
   * this color will be applied to the renderer's background when the level is spawned
   * into the world.
   */
  public bgColor?: number;

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

  public readonly events = new EventQueue<LevelEvent>();

  /**
   * Defines the layers available to this level. Each entry describes the shape of a
   * layer. The actual data is stored per chunk. This array only contains the layer
   * definitions used by the level system.
   */
  public readonly layers: Layer[] = [];

  /** Contains all chunks that are currently loaded. */
  public readonly loaded = new Set<Chunk>();

  /** Contains the tilesets with which tiles, objects etc. are rendered on this map. */
  public readonly tilesets = new LocalTilesetBag<T>();

  /**
   * @param grid Grid that defines the dimensions of the entire tilemap. The cell size
   *  defines the size of an individual tile. Columns and rows how many tiles there are
   *  in total in each direction.
   * @param layout Grid that defines the layout of how chunks are laid out. Columns and
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

  /**
   * Returns the {@link Chunk} at the given position, if any.
   *
   * @param x Position along x-axis relative to the level grid, in px.
   * @param y Position along y-axis relative to the level grid, in px.
   */
  public getChunkAt(x: number, y: number): Chunk | undefined {
    return this.getChunk(this.getChunkIndexAt(x, y));
  }

  /**
   * Returns the chunk index at the given px position.
   *
   * @param x Position along x-axis relative to the level grid, in px.
   * @param y Position along y-axis relative to the level grid, in px.
   */
  public getChunkIndexAt(x: number, y: number): number {
    const location = this.grid.getLocation(this.grid.getIndexAt(x, y), SCRATCH_VEC2);

    return this.layout.getIndexAt(
      location.x,
      location.y
    );
  }

  public createChunk(index: number, unitSize: number): Chunk {
    if (this.getChunk(index)) {
      throw new Error(`A chunk at index ${index} already exists.`);
    }

    // Calculate size in world units.
    const w = this.grid.cellWidth * this.layout.cellWidth / unitSize;
    const h = this.grid.cellHeight * this.layout.cellHeight / unitSize;

    // Get chunk grid coordinates.
    const { x, y } = this.layout.getLocation(index, SCRATCH_VEC2);

    const grid = new Grid(
      this.layout.cellWidth,
      this.layout.cellHeight,
      this.grid.cellWidth,
      this.grid.cellHeight
    );

    const chunk = {
      bounds: new Rectangle(w, h, x * w, y * h),
      entities: [],
      layers: {},
      meta: {},
      state: ChunkState.Pending,
      grid,
      index,
      x,
      y
    }

    this.chunks.push(chunk);

    return chunk;
  }



  /**
   * Expands the level {@link layout} to accommodate the specified coordinates. The
   * layout is expanded on a per-chunk basis.
   *
   * @param x - The x-axis position in pixels. Relative to the grid.
   * @param y - The y-axis position in pixels. Relative to the grid.
   */
  public growToPos(x: number, y: number): void {
    if (x < 0 || y < 0) {
      return;
    }

    const { layout, grid } = this;

    // Store the current state of the grid in our scratch. We'll need these values
    // later to re-arrange the grid.
    SCRATCH_GRID.copy(layout);

    const cols = layout.cellWidth;
    const rows = layout.cellHeight;

    const chunkCol = Math.floor(x / (grid.cellWidth * cols));
    const chunkRow = Math.floor(y / (grid.cellHeight * rows));

    layout.cols = Math.max(layout.cols, chunkCol + 1);
    layout.rows = Math.max(layout.rows, chunkRow + 1);

    grid.cols = Math.max(grid.cols, layout.cols * cols);
    grid.rows = Math.max(grid.rows, layout.rows * rows);

    this.reindex(SCRATCH_GRID);
  }
  
  /**
   * Re-indexes {@link chunks} after the dimensions of the level have been changed.
   *
   * @param prev The old chunk layout.
   */
  public reindex(prev: Grid): void {
    if (prev.cols !== this.layout.cols) {
      let pos: XY;

      for (const chunk of this.chunks) {
        pos = prev.getLocation(chunk.index, SCRATCH_VEC2);
        chunk.index = this.layout.getIndex(pos.x, pos.y);
      }
    }
  }

}
