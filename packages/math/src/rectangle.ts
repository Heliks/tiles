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

  /** Returns `true` if coordinates `x` and `a` are inside of a `box`. */
  public static contains(box: RectangleBounds, x: number, y: number): boolean {
    return box.x <= x && x <= (box.x + box.width)
      && box.y <= y && y <= (box.y + box.height);
  }

  /** Returns `true` if coordinates `x` and `a` are inside of a this rectangle. */
  public contains(x: number, y: number): boolean {
    return Rectangle.contains(this, x, y);
  }

}
