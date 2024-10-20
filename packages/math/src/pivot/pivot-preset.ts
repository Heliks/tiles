import { Pivot } from './pivot';


export class PivotPreset {

  /** {@link Pivot} preset where the pivot is in the bottom-left corner. */
  public static readonly BOTTOM_LEFT = new Pivot(0, 1);

  /** {@link Pivot} preset where the pivot is in the bottom-right corner. */
  public static readonly BOTTOM_RIGHT = new Pivot(1, 1);

  /** {@link Pivot} preset where the pivot is on the bottom side. */
  public static readonly BOTTOM = new Pivot(0.5, 1);

  /** {@link Pivot} preset where the pivot is in the top-left corner. */
  public static readonly TOP_LEFT = new Pivot(0, 0);

  /** {@link Pivot} preset where the pivot is in the top-right corner. */
  public static readonly TOP_RIGHT = new Pivot(1, 0);

  /** {@link Pivot} preset where the pivot is on the top side. */
  public static readonly TOP = new Pivot(0.5, 0);

  /** {@link Pivot} preset where the pivot is on the left side. */
  public static readonly LEFT = new Pivot(0, 0.5);

  /** {@link Pivot} preset where the pivot is on the right side. */
  public static readonly RIGHT = new Pivot(1, 0.5);

  /** {@link Pivot} preset where the pivot is in the center. */
  public static readonly CENTER = new Pivot(0.5, 0.5);

}
