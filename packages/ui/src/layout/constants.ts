import { Line } from './line';
import { Rect } from './rect';


/**
 * Caches intermediate computations during layout computation. This class is considered
 * internal and should not be manually edited.
 */
export class Constants {

  /** Calculated flex basis. */
  public baseSize = 0;

  /** Calculated inner flex basis. */
  public innerBaseSize = 0;

  /**
   * Definite initial free space along the main axis before flex factors are applied
   * to flex items of this node.
   */
  public initialFreeSpace = 0;

  /** Is content laid out as column or row? */
  public isRow = true;

  /** Unfrozen nodes have yet to resolve their flexible lengths. */
  public frozen = false;

  /** Computed flex lines. */
  public readonly lines: Line[] = [];

  /** Inner size that the node wants to be. */
  public readonly hypotheticalInnerSize = new Rect(0, 0);

  /** Outer size that the node wants to be. */
  public readonly hypotheticalOuterSize = new Rect(0, 0);

  /** Computed definite outer size. */
  public readonly outerSize = new Rect(0, 0);

  /** Size that the node *should* be after flexible lengths have been resolved. */
  public readonly targetSize = new Rect(0, 0);

  /** Scratch for internal measurement computation. Clear before use. */
  public readonly scratch1 = Rect.option<number>();

  /** Scratch for internal measurement computation. Clear before use. */
  public readonly scratch2 = Rect.option<number>();

  /**
   * Computed definite node size. The computation for this node is complete when both
   * the main and cross axis are determined.
   */
  public readonly size = Rect.option<number>();

  /** Computed available space that content inside the node can occupy. */
  public readonly space = new Rect(0, 0);

  /** Contains `true` if node is multiline. */
  public wrap = false;

}

