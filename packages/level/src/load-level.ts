import { AssetLoader, Format, getDirectory } from '@heliks/tiles-assets';
import { Grid, Injectable, Rectangle } from '@heliks/tiles-engine';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { Layer, LayerData, LayerDataMap } from './layers';
import { ChunkState, Level } from './level';
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

export interface LevelFormatTilesetData {
  /** Start of the tilesets ID range. */
  firstId: number;
  /** Path to the tileset file, relative to the level file. */
  path: string;
}

export interface LevelFormatChunkLayer<D extends LayerData = LayerData> {
  /** Layer specific data.  */
  data: D;
  /** ID of the {@link Layer} for which this data belongs to.*/
  layerId: number;
}

export interface LevelFormatChunkData {
  bounds: RectangleData;
  index: number;
  layers: LevelFormatChunkLayer[];
  x: number;
  y: number;
}

export interface LevelFormatData {
  grid: GridData;
  layout: GridData;
  tilesets: LevelFormatTilesetData[];
  chunks: LevelFormatChunkData[];
  layers: Layer[];
}


function parseLevelChunks(level: Level, data: LevelFormatData): void {
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
    );

    const layers: LayerDataMap = {};

    for (const layer of chunk.layers) {
      layers[layer.layerId] = layer.data;
    }

    level.chunks.push({
      bounds,
      grid,
      layers,
      entities: [],
      index: chunk.index,
      state: ChunkState.Pending,
      x: chunk.x,
      y: chunk.y
    })
  }
}

async function _load(data: LevelFormatTilesetData, file: string, loader: AssetLoader) {
  const tileset = await loader.fetch<Tileset>(getDirectory(file, data.path));

   return new LocalTileset(tileset, data.firstId);
}

@Injectable()
export class LoadLevel implements Format<LevelFormatData, Level> {

  /** @inheritDoc */
  public readonly extensions = ['level', 'level.json'];

  /** @inheritDoc */
  public async process(data: LevelFormatData, file: string, loader: AssetLoader): Promise<Level> {
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

    level.layers.push(...data.layers);

    for (const tileset of tilesets) {
      level.tilesets.set(tileset);
    }

    parseLevelChunks(level, data);

    return level;
  }

}
