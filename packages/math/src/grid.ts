import { vec2, Vec2 } from './vec2';

export class Grid {

  /** Contains the total amount of cells in this grid. */
  public get size(): number {
    return this.cols * this.rows;
  }

  /** Contains the total width of the grid. */
  public get width(): number {
    return this.cols * this.cellWidth;
  }

  /** Contains the total height of the grid. */
  public get height(): number {
    return this.rows * this.cellHeight;
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

  /** Returns the top-left aligned position of the sprite at the given `index`. */
  public pos(index: number, out = vec2(0, 0)): Vec2 {
    out.x = index % this.cols * this.cellWidth;
    out.y = Math.floor(index / this.cols) * this.cellHeight;

    return out;
  }

  /**
   * Converts a top-left aligned `pos` vector of a cell and converts its values to be
   * center aligned.
   */
  public toCenter(pos: Vec2): Vec2 {
    // The bitshift is a faster way of dividing by 2.
    pos.x += this.cellWidth >> 1;
    pos.y += this.cellHeight >> 1;

    return pos;
  }

}
