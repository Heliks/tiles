import { vec2, Vec2 } from './vec2';

/**
 * Simple 2D grid.
 *
 * The grid is able to extend into negative space depending on its own size, meaning
 * that a 5x5 grid can also extend to a total of -5 rows and -5 columns.
 */
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
    out.y = Math.round(index / this.cols) * this.cellHeight;

    // Normalize negative zeros (which javascript treats as a different value to
    // positives). This can happen on the calculation of the y position if the given
    // index is located in negative space, which would would result in a different
    // result depending on where the index is located. We want to avoid this as -0 and
    // +0 are factually the same as a coordinate.
    if (Object.is(out.y, -0)) {
      out.y = 0;
    }

    return out;
  }

  /** Returns the index of the cell on which the position `x` and `y` is located. */
  public index(x: number, y: number): number {
    let col = x / this.cellWidth;
    let row = y / this.cellHeight;

    col = x >= 0 ? Math.floor(col) : Math.ceil(col);
    row = x >= 0 ? Math.floor(row) : Math.ceil(col)

    const index = (row * this.cols) + col;

    // Normalize negative zero (which javascript treats as a different value to
    // positives). This happens when the given x and y positions are located in negative
    // space but are still located on the cell with index 0. We want to avoid this
    // behavior as an index of -0 is factually the same as an index of 0.
    return Object.is(index, -0) ? 0 : index;
  }

  /**
   * Converts a top-left aligned `pos` vector of a cell and converts its values to be
   * center aligned.
   */
  public toCenter(pos: Vec2): Vec2 {
    // The bitshift is a faster way of dividing by 2.
    const cw = this.cellWidth >> 1;
    const ch = this.cellHeight >> 1;

    pos.x = pos.x >= 0 ? pos.x + cw : pos.x - cw;
    pos.y = pos.y >= 0 ? pos.y + ch : pos.y - ch;

    return pos;
  }

}
