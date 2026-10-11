import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Rectangle, Vec2 } from '@heliks/tiles-engine';
import { ChunkState, Level, Tileset } from '@heliks/tiles-level';
import { hex2int } from '@heliks/tiles-pixi';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { getCustomProps, parseChunkLayerData, parseLayers, ParserConfig } from '../parser';
import { isLocalTilesetExternal, TmxLocalTilesetData, TmxMapData } from '../tmx';


/**
 * Default value for the number of tiles that a chunk occupies. Will be used as a
 * fallback if this is not specified on the loaded map.
 *
 * @internal
 */
const TMX_DEFAULT_CHUNK_SIZE = 16;

/**
 * Returns the total number of columns and rows on the given `map`. This also works for
 * infinite maps, which, according to the TMX specification, have a size of `0`
 *
 * @internal
 */
function getMapSize(map: TmxMapData): Vec2 {
  const size = new Vec2(map.width, map.height);

  if (! map.infinite) {
    return size;
  }

  // Determine size of infinite maps by finding the largest layer.
  for (const layer of map.layers) {
    if (layer.width > size.x) {
      size.x = layer.width;
    }

    if (layer.height > size.y) {
      size.y = layer.height;
    }
  }

  return size;
}

/**
 * Creates a {@link Grid} that defines how chunks are arranged on a level.
 *
 * Columns and rows define the number of chunks in each direction. The cell size
 * defines the number of tiles in each chunk.
 *
 * Finite maps that don't have chunks will have a single chunk that covers the
 * entire size of the map.
 *
 * @internal
 */
function getChunkLayout(data: TmxMapData): Grid {
  const size = getMapSize(data);

  if (! data.infinite) {
    return new Grid(1, 1, size.x, size.y);
  }

  let chunksX = TMX_DEFAULT_CHUNK_SIZE;
  let chunksY = TMX_DEFAULT_CHUNK_SIZE;

  if (data.editorsettings?.chunksize) {
    chunksX = data.editorsettings.chunksize.width;
    chunksY = data.editorsettings.chunksize.height;
  }

  return new Grid(
    Math.ceil(size.x / chunksX),
    Math.ceil(size.y / chunksY),
    chunksX,
    chunksY
  );
}

/**
 * Creates a {@link Grid} that defines how tiles are arranged on a chunk.
 *
 * Columns and rows define the number of tiles in each direction. The cell size
 * defines the size of each tile.
 *
 * Finite maps that don't have chunks will have a single chunk that covers the
 * entire size of the map.
 *
 * @internal
 */
function getChunkGrid(data: TmxMapData): Grid {
  let tilesW = TMX_DEFAULT_CHUNK_SIZE;
  let tilesH = TMX_DEFAULT_CHUNK_SIZE;

  if (data.infinite) {
    if (data.editorsettings?.chunksize) {
      tilesW = data.editorsettings.chunksize.width;
      tilesH = data.editorsettings.chunksize.height;
    }
  }
  else {
    const size = getMapSize(data);

    tilesW = size.x;
    tilesH = size.y;
  }

  return new Grid(
    tilesW,
    tilesH,
    data.tilewidth,
    data.tileheight
  );
}

/** @internal */
async function parseLocalTileset(loader: AssetLoader, file: string, data: TmxLocalTilesetData): Promise<LocalTileset<Tileset>> {
  // Note: As of now, there is no way to serialize sprites that are created from assets
  // without a source location. Therefore, we can not spawn objects that use sprites
  // from embedded tilesets without completely breaking serialization.
  if (! isLocalTilesetExternal(data)) {
    throw new Error('Embedded Tilesets are not supported.');
  }

  const tileset = await loader.fetch<Tileset>(getDirectory(file, data.source));

  return new LocalTileset(tileset, data.firstgid);
}

/** @internal */
function parseLocalTilesets(loader: AssetLoader, file: string, data: TmxMapData): Promise<LocalTileset<Tileset>[]> {
  return Promise.all(
    data.tilesets.map(
      tilesetData => parseLocalTileset(loader, file, tilesetData)
    )
  );
}


/**
 * Asset loader format to parse Tiled `.tmj` files.
 *
 * - `P`: Expected custom properties.
 */
export class TmxLoadTilemap<P = unknown> implements Format<TmxMapData, Level<P>> {

  /** @inheritDoc */
  public readonly extensions = ['tmj'];

  constructor(public readonly config: ParserConfig) {}

  /**
   * Calculates the physical boundaries of a chunk at a given location.
   *
   * @param grid The chunks' tile grid.
   * @param x Grid location of the chunk along the x-axis.
   * @param y Grid location of the chunk along the y-axis.
   */
  public getChunkBounds(grid: Grid, x: number, y: number): Rectangle {
    const cx = (x * grid.cols * grid.cellWidth);
    const cy = (y * grid.rows * grid.cellHeight);

    return new Rectangle(grid.width, grid.height, cx, cy).divide(this.config.unitSize);
  }

  /** @inheritDoc */
  public async process(data: TmxMapData, file: string, loader: AssetLoader): Promise<Level<P>> {
    // Create the layout of each chunk. We need this to parse tile layers.
    const chunkGrid = getChunkGrid(data);

    const grid = new Grid(
      data.width,
      data.height,
      data.tilewidth,
      data.tileheight
    );

    const layout = getChunkLayout(data);
    const props = getCustomProps<P>(data);
    const level = new Level(grid, layout, props);

    // Create the level layers.
    level.layers.push(...parseLayers(data));

    // Populate level chunks with data from layers.
    for (let cx = 0; cx < level.layout.cols; cx++) {
      for (let cy = 0; cy < level.layout.rows; cy++) {
        const bounds = this.getChunkBounds(chunkGrid, cx, cy);
        const index = layout.getIndex(cx, cy);
        const layers = parseChunkLayerData(data, chunkGrid, cx, cy, this.config);

        level.chunks.push({
          entities: [],
          grid: chunkGrid,
          state: ChunkState.Pending,
          bounds,
          index,
          layers,
          x: cx,
          y: cy
        });
      }
    }

    const tilesets = await parseLocalTilesets(loader, file, data);

    for (const tileset of tilesets) {
      level.tilesets.set(tileset);
    }

    if (data.backgroundcolor) {
      level.bgColor = hex2int(data.backgroundcolor);
    }

    return level;
  }

}
