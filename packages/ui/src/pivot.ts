import { Vec2, XY } from '@heliks/tiles-engine';


/**
 * Specifies the pivot of a UI node based on percentages.
 *
 * For example, the anchor `[0.5, 0.75]` would set the pivot of the UI element to `50%`
 * of its own width, and 75% of its own height.
 */
export type Pivot = readonly [x: number, y: number];

/**
 * Applies `pivot` to `drawable`.
 *
 * @see Pivot
 */
export function getPivotPosition(pivot: Pivot, width: number, height: number, out: XY = new Vec2()): XY {
  out.x = width * pivot[0];
  out.y = height * pivot[1];

  return out;
}

/** {@link Pivot} preset that sets the pivot of a UI element to its bottom left corner. */
export const PIVOT_BOTTOM_LEFT: Pivot = [0, 1];

/** {@link Pivot} preset that sets the pivot of a UI element to  its bottom right corner. */
export const PIVOT_BOTTOM_RIGHT: Pivot = [1, 1];

/** {@link Pivot} preset that sets the pivot of a UI element to its bottom side. */
export const PIVOT_BOTTOM: Pivot = [0.5, 1];

/** {@link Pivot} preset that sets the pivot of a UI element to its top left corner. */
export const PIVOT_TOP_LEFT: Pivot = [0, 0];

/** @link Pivot} preset that sets the pivot of a UI element to its top right corner. */
export const PIVOT_TOP_RIGHT: Pivot = [1, 0];

/** {@link Pivot} preset that sets the pivot of a UI element to its top side. */
export const PIVOT_TOP: Pivot = [0.5, 0];

/** {@link Pivot} preset that sets the pivot of a UI element to its left side. */
export const PIVOT_LEFT: Pivot = [0, 0.5];

/** {@link Pivot} preset that sets the pivot of a UI element to its right side. */
export const PIVOT_RIGHT: Pivot = [1, 0.5];

