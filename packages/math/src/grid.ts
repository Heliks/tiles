import { Vec2 } from './vec2';


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

  /** Returns the top-left aligned position of the cell that occupies the given `index`. */
  public getPosition(index: number, out = new Vec2()): Vec2 {
    out.x = index % this.cols * this.cellWidth;
    out.y = Math.floor(index / this.cols) * this.cellHeight;

    return out;
  }

  /** Returns the index of the cell that is located at `col` and `row`. */
  public getIndex(col: number, row: number): number {
    return (row * this.cols) + col;
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
    return cell < 0 || cell >= this.size;
  }

  /** Returns `true` if `col` and `row` are within the bounds of this grid. */
  public isLocationInBounds(col: number, row: number): boolean {
    return col < this.cols && row < this.rows;
  }

}
