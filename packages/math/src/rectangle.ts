import { Shape } from './shape';
import { XY } from './vec2';


/** Dimensions of a rectangular box. */
export interface Box {
  width: number;
  height: number;
  x: number;
  y: number;
}


/** A rectangle shape. */
export class Rectangle implements Shape, Box {

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
  public clone(): Rectangle {
    return new Rectangle(this.width, this.height, this.x, this.y);
  }

  /** Copies the values of the given `box` to this rectangle. */
  public copy(box: Box): this {
    this.width = box.width;
    this.height = box.height;

    this.x = box.x;
    this.y = box.y;

    return this;
  }

  /**
   * Updates the rectangle boundaries
   *
   * @param width New width.
   * @param height New height.
   * @param x New position along x-axis. Defaults to `0` if not defined.
   * @param y New position along y-axis. Defaults to `0` if not defined.
   */
  public set(width: number, height: number, x = 0, y = 0): this {
    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;

    return this;
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
