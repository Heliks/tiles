import { Grid } from '@heliks/tiles-engine';


/**
 * Returns all cells that are within a Manhattan distance around the given `x` and `y`
 * location. This includes the cell from which the distance is measured.
 *
 * @example
 *
 * Consider the following 7x7 grid with a grid location at (3,3) and Manhattan
 * distance of 2:
 *
 * ```
 * · · · · · · ·
 * · · · ▪ · · ·
 * · · ▪ ▪ ▪ · ·
 * · ▪ ▪ ● ▪ ▪ ·
 * · · ▪ ▪ ▪ · ·
 * · · · ▪ · · ·
 * · · · · · · ·
 * ```
 *
 * - ● Center from where the distance is measured. (x=3, y=3)
 * - ▪ Cells within the specified distance.
 * - · Cells outside the specified distance.
 */
export function getCellsFromDistance(grid: Grid, x: number, y: number, distance: number, out: number[] = []): number[] {
  out.length = 0;

  const sx = Math.max(0, x - distance);
  const sy = Math.max(0, y - distance);

  const ex = Math.min(grid.cols - 1, x + distance);
  const ey = Math.min(grid.rows - 1, y + distance);

  for (let ny = sy; ny <= ey; ny++) {
    const dy = Math.abs(ny - y);
    const rb = ny * grid.cols;

    for (let nx = sx; nx <= ex; nx++) {
      const dx = Math.abs(nx - x);

      if (dx + dy <= distance) {
        out.push(rb + nx);
      }
    }
  }

  return out;
}
