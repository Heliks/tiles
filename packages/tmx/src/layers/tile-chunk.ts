import { Grid } from '@heliks/tiles-engine';


export class TileChunk {

  /**
   * @param grid Grid that describes tile arrangement in this chunk. Columns and rows
   *  determine amount of tiles in each direction, cell size determines tile size.
   * @param data Tile data.
   * @param x X axis position in px, relative to the top left corner of the map.
   * @param y Y axis position in px, relative to the top left corner of the map.
   */
  constructor(
    public readonly grid: Grid,
    public readonly data: number[],
    public readonly x: number,
    public readonly y: number
  ) {}

}