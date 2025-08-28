import { clamp } from './utils';
import { Vec2, XY } from './vec2';


export class Grid {

  /** Contains the total number of cells in this grid. */
  public get size(): number {
    return this.cols * this.rows;
  }

  /** Total width of the grid. */
  public get width(): number {
    return this.cols * this.cellWidth;
  }

  /** Total height of the grid. */
  public get height(): number {
    return this.rows * this.cellHeight;
  }

  /**
   * @param cols Number of grid columns.
   * @param rows Number of grid rows.
   * @param cellWidth Width of each grid cell.
   * @param cellHeight Height of each grid cell.
   */
  constructor(
    public cols: number,
    public rows: number,
    public cellWidth = 1,
    public cellHeight = 1
  ) {}

  /** Returns the grid coordinates of the given `cell` index. */
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

  /** Returns the top-left corner position of the given `cell` index. */
  public getPosition(cell: number, out = new Vec2()): XY {
    const loc = this.getLocation(cell, out);

    loc.x *= this.cellWidth;
    loc.y *= this.cellHeight;

    return loc;
  }

  /**
   * Converts a grid coordinate to a cell index.
   *
   * Input values are automatically clamped to the boundaries of this grid.
   *
   * @example
   * ```ts
   *  const grid = new Grid(5, 5);
   *
   *  grid.getIndex(1, 1); // Returns 6
   *  grid.getIndex(-1, -1); // Returns 0 (clamped)
   *  grid.getIndex(6, 1); // Returns 9 (clamped)
   * ```
   */
  public getIndex(col: number, row: number): number {
    return (clamp(row, 0, this.rows - 1) * this.cols) + clamp(col, 0, this.cols - 1);
  }

  /**
   * Converts a grid position to a cell index.
   *
   * @remarks
   *
   * This is functionally the same as {@link getIndex}. The only difference is that
   * this function additionally accepts floating point values.
   *
   * For example:
   *
   *  - x: 5.5, y: 4.9 will be rounded to col: 5, row: 4
   *  - x: 8.3, y: 2.7 will be rounded to col: 8, row: 2
   *  - ... etc.
   */
  public getIndexAt(x: number, y: number): number {
    return this.getIndex(
      Math.floor(x / this.cellWidth),
      Math.floor(y / this.cellHeight)
    );
  }

  /** Checks if the given `cell` index is within the boundaries of this grid. */
  public isIndexInBounds(cell: number): boolean {
    return cell >= 0 && cell < this.size;
  } 

  /** Checks if the given coordinates are within the boundaries of this grid. */
  public isLocationInBounds(col: number, row: number): boolean {
    return col < this.cols && col >= 0 && row < this.rows && row >= 0;
  }

  /** Checks if the given position is within the boundaries of this grid. */
  public isPositionInBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x <= this.width && y <= this.height;
  }

  /** Returns a new {@link Grid} that is identical to this one. */
  public clone(): Grid {
    return new Grid(this.cols, this.rows, this.cellWidth, this.cellHeight);
  }

}
