import { Shape } from './shape';
import { XY } from './vec2';


/** Boundaries of a rectangle. */
export interface RectangleBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

/** A rectangle shape. */
export class Rectangle implements Shape, RectangleBounds {

  /**
   * @param width The rectangles width.
   * @param height The rectangles height.
   * @param x (optional) Position along x-axis.
   * @param y (optional) Position along y-axis.
   */
  constructor(public width: number, public height: number, public x = 0, public y = 0) {}

  /**
   * Checks if `x` and `y` are inside a rectangle boundary.
   *
   * @param x Position along x-axis to check.
   * @param y Position along y-axis to check.
   * @param bx Rectangle boundary position along x-axis.
   * @param by Rectangle boundary position along y-axis.
   * @param bw Rectangle boundary width.
   * @param bh Rectangle boundary height.
   */
  public static contains(x: number, y: number, bx: number, by: number, bw: number, bh: number): boolean {
    return Boolean(x <= (bx + bw) && y <= (by + bh) && x >= bx && y >= by);
  }

  /** @inheritDoc */
  public copy(): Rectangle {
    return new Rectangle(this.width, this.height, this.x, this.y);
  }

  /** @inheritDoc */
  public scale(factor: number | XY): this {
    if (typeof factor === 'number') {
      this.width *= factor;
      this.height *= factor;
    }
    else {
      this.width *= factor.x;
      this.height *= factor.y;
    }

    return this;
  }

  /** Checks if `x` and `y` are inside the boundaries of this rectangle. */
  public contains(x: number, y: number): boolean {
    return Rectangle.contains(x, y, this.x, this.y, this.width, this.height);
  }

}
