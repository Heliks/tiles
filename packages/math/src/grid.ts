import { clamp } from './utils';
import { Vec2, XY } from './vec2';


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
    public cols: number,
    public rows: number,
    public cellWidth = 1,
    public cellHeight = 1
  ) {}

  /**
   * Returns a vector that represents the location of a `cell` index. The x-axis
   * represents the grid column, y the grid row.
   */
  public getLocation(cell: number, out?: XY): XY {
    const x = cell % this.cols;
    const y = Math.floor(cell / this.cols);

    if (out) {
      out.x = x;
      out.y = y;
    }
    else {
      out = { x, y };
    }

    return out;
  }

  /** Returns the top-left aligned position of a `cell` index. */
  public getPosition(cell: number, out = new Vec2()): XY {
    const loc = this.getLocation(cell, out);

    loc.x *= this.cellWidth;
    loc.y *= this.cellHeight;

    return loc;
  }

  /** Returns the index of the cell that is located at `col` and `row`. */
  public getIndex(col: number, row: number): number {
    return (clamp(row, 0, this.rows - 1) * this.cols) + clamp(col, 0, this.cols - 1);
  }

  /** Returns the index of the cell that is located at the position `x` and `y` */
  public getIndexAt(x: number, y: number): number {
    return this.getIndex(
      Math.floor(x / this.cellWidth),
      Math.floor(y / this.cellHeight)
    );
  }

  /** Returns `true` if a `cell` index is within the bounds of this grid. */
  public isIndexInBounds(cell: number): boolean {
    return cell >= 0 && cell < this.size;
  }

  /** Returns `true` if `col` and `row` are within the bounds of this grid. */
  public isLocationInBounds(col: number, row: number): boolean {
    return col < this.cols && col >= 0 && row < this.rows && row >= 0;
  }

  /** Returns a new {@link Grid} that is identical to this one. */
  public clone(): Grid {
    return new Grid(this.cols, this.rows, this.cellWidth, this.cellHeight);
  }

}
