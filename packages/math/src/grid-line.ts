import { XY } from './vec2';


/**
 * Allocation-free implementation of a bresenham traversal algorithm used to walk a
 * straight line between two points on a grid.
 */
export class GridLine {

  /** Grid location along the x-axis of the cell where the line currently points to. */
  public x = 0;

  /** Grid location along the y-axis of the cell where the line currently points to. */
  public y = 0;

  private endX = 0;
  private endY = 0;

  private dx = 0;
  private dy = 0;

  private width = 0;
  private height = 0;

  private error = 0;
  private initial = false;

  /**
   * Get ready to walk a new line, forgetting any previous line.
   *
   * @param x Starting cell column.
   * @param y Starting cell row.
   * @param endX Target cell column.
   * @param endY Target cell row.
   */
  public reset(x: number, y: number, endX: number, endY: number): void {
    this.x = x;
    this.y = y;

    this.endX = endX;
    this.endY = endY;

    // How far must we travel sideways and up/down? Keeping height negative
    // lets the two directions push our balancing score in opposite directions.
    this.width = Math.abs(endX - x);
    this.height = -Math.abs(endY - y);

    // Each step moves one cell toward the target: right/left and down/up.
    this.dx = x < endX ? 1 : -1;
    this.dy = y < endY ? 1 : -1;

    // This score helps us stay close to the straight line. Each sideways step
    // lowers it; each up/down step raises it. The tests below keep it balanced.
    this.error = this.width + this.height;
    this.initial = true;
  }

  /**
   * Moves the line to the next cell. Returns `true` when the line points to a valid
   * cell, or `false` once all cells in the line have been visited.
   *
   * The first call will keep the line at the starting cell. Further calls will step
   * towards the lines' target.
   *
   * @example
   * ```ts
   * const line = new GridLine();
   *
   * // Start traversing a new line.
   * line.reset(0, 0, 10, 10);
   * line.next();
   *
   * // 0, 0
   * console.log(line.x, line.y);
   *
   * line.next();
   *
   * // 1, 1
   * console.log(line.x, line.y);
   * ```
   */
  public next(): boolean {
    // Show the starting tile before taking any steps.
    if (this.initial) {
      this.initial = false;

      return true;
    }

    // We already showed the target cell, so our walk is finished.
    if (this.x === this.endX && this.y === this.endY) {
      return false;
    }

    // Take a snapshot so both decisions use the same score, even if the first
    // step changes it. Doubling the score lets us compare using whole numbers.
    const next = 2 * this.error;

    // Does the score say we should take a sideways step?
    if (next >= this.height) {
      this.error += this.height;
      this.x += this.dx;
    }

    // Does it also say we should step up/down? Both tests can pass, giving us
    // a diagonal step. Using "else if" here would prevent diagonal steps.
    if (next <= this.width) {
      this.error += this.width;
      this.y += this.dy;
    }

    return true;
  }

  public toPoint(out?: XY): XY {
    if (! out) {
      return {
        x: this.x,
        y: this.y
      };
    }

    out.x = this.x;
    out.y = this.y;

    return out;
  }

}
