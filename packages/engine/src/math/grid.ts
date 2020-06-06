import { Vec2 } from '../types';

export class Grid {

  /** Contains the total amount of cells in this grid. */
  public get size(): number {
    return this.cols * this.rows;
  }

  /**
   * @param cols The total amount of columns in the grid.
   * @param rows The total amount of rows in the grid.
   * @param cellWidth Width of each individual cell in the grid.
   * @param cellHeight Height of each individual cell in the grid.
   */
  constructor(
    public readonly cols: number,
    public readonly rows: number,
    public readonly cellWidth: number,
    public readonly cellHeight: number
  ) {}

  /** Returns the position of the sprite at the given `index`. */
  public pos(index: number): Vec2 {
    return [
      index % this.cols * this.cellWidth,              // X
      Math.floor(index / this.cols) * this.cellHeight  // Y
    ];
  }

}
