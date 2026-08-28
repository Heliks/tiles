import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Rectangle } from '@heliks/tiles-engine';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { ChunkLayer, ChunkState, Level } from './level';
import { Tileset } from './tileset';


export type GridData = [
  cols: number,
  rows: number,
  cellWidth: number,
  cellHeight: number
];

export type RectangleData = [
  x: number,
  y: number,
  width: number,
  height: number
];

export interface LocalTilesetData {
  firstId: number;
  path: string;
}

export interface ChunkData<M extends object = {}> {
  bounds: RectangleData;
  index: number;
  layers: ChunkLayer[];
  meta: M;
  x: number;
  y: number;
}

export interface LevelData {
  grid: GridData;
  layout: GridData;
  tilesets: LocalTilesetData[];
  chunks: ChunkData[];
}

function parseLevelChunks(level: Level, data: LevelData): void {
  const grid = new Grid(
    level.layout.cellWidth,
    level.layout.cellHeight,
    level.grid.cellWidth,
    level.grid.cellHeight
  );

  for (const chunk of data.chunks) {
    const bounds = new Rectangle(
      chunk.bounds[2],
      chunk.bounds[3],
      chunk.bounds[0],
      chunk.bounds[1],
    )

    level.chunks.push({
      bounds,
      grid,
      entities: [],
      index: chunk.index,
      meta: chunk.meta,
      layers: chunk.layers,
      state: ChunkState.Pending,
      x: chunk.x,
      y: chunk.y
    })
  }
}

async function _load(data: LocalTilesetData, file: string, loader: AssetLoader) {
  const tileset = await loader.fetch<Tileset>(getDirectory(file, data.path));

   return new LocalTileset(tileset, data.firstId);
}


export class LevelFormat implements Format<LevelData, Level> {

  /** @inheritDoc */
  public readonly extensions = ['level', 'level.json'];

  /** @inheritDoc */
  public async process(data: LevelData, file: string, loader: AssetLoader): Promise<Level> {
    const tilesets = await Promise.all(
      data.tilesets.map(
        tileset => _load(tileset, file, loader)
      )
    );

    const grid = new Grid(
      data.grid[0],
      data.grid[1],
      data.grid[2],
      data.grid[3]
    );

    const layout = new Grid(
      data.layout[0],
      data.layout[1],
      data.layout[2],
      data.layout[3]
    );

    const level = new Level(grid, layout, {});

    for (const tileset of tilesets) {
      level.tilesets.set(tileset);
    }

    parseLevelChunks(level, data);

    return level;
  }

}
