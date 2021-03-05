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

  /** Returns the top-left aligned position of the cell that occupies the given `index`. */
  public position(index: number, out = vec2(0, 0)): Vec2 {
    out.x = index % this.cols * this.cellWidth;
    out.y = Math.floor(index / this.cols) * this.cellHeight;

    return out;
  }

  /** Returns the index of the cell on which the position `x` and `y` is located. */
  public index(x: number, y: number): number {
    const col = Math.floor(x / this.cellWidth);
    const row = Math.floor(y / this.cellHeight);

    return (row * this.cols) + col;
  }

  /**
   * Returns an array that contains all cell indexes that are neighbours to `index`.
   *
   * ### Example
   *
   * Given the following 5x5 grid:
   *
   * ```
   * +--------------+
   * | 0| 1| 2| 3| 4|
   * | 5| 6| 7| 8| 9|
   * |10|11|12|13|14|
   * |15|16|17|18|19|
   * |20|21|22|23|24|
   * +--------------+
   * ```
   *
   * We get the following indexes as neighbours:
   *
   * ```ts
   * const grid = new Grid(5, 5, 0, 0);
   *
   * // [1, 5, 6]
   * console.log(grid.getNeighbourIndexes(0));
   *
   * // [6, 7, 8, 11, 13, 16, 17, 18]
   * console.log(grid.getNeighbourIndexes(12));
   * ```
   * */
  public getNeighbourIndexes(index: number, out: number[] = []): number[] {
    const col = index % this.cols;
    const row = (index / this.rows) | 0;

    // Calculate start / end positions to iterate over.
    const sx = Math.max(col - 1, 0);
    const ex = Math.min(col + 1, this.size - 1);

    const sy = Math.max(row - 1, 0);
    const ey = Math.min(row + 1, this.size - 1);

    for (let y = sy; y <= ey; y++) {
      for (let x = sx; x <= ex; x++) {
        // If we are not out of bounds convert the x and y position back to an index
        // and push it to the output. Also ignore the index for which we were looking
        // for itself as it is not a neighbour.
        if (!(x === col && y === row) && x < this.cols && y < this.rows) {
          out.push(y * this.cols + x);
        }
      }
    }

    return out;
  }

  /**
   * Converts a top-left aligned `pos` vector of a cell and converts its values to be
   * center aligned.
   */
  public getCellMiddlePosition(pos: Vec2): Vec2 {
    // The bitshift is a faster way of dividing by 2.
    pos.x += this.cellWidth >> 1;
    pos.y += this.cellHeight >> 1;

    return pos;
  }

}
