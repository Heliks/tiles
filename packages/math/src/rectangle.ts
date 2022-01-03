/** Boundaries of a rectangle. */
export interface RectangleBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

/** A rectangle shape. */
export class Rectangle implements RectangleBounds {

  /**
   * @param width The rectangles width.
   * @param height The rectangles height.
   * @param x (optional) Position on x axis.
   * @param y (optional) Position on y axis.
   */
  constructor(public width: number, public height: number, public x = 0, public y = 0) {}

  /**
   * Returns `true` if the coordinates `x` and `y` are inside of the rectangle bounds
   * of `rect`.
   */
  public static contains(rect: RectangleBounds, x: number, y: number): boolean {
    return rect.x <= x && x <= (rect.x + rect.width)
      && rect.y <= y && y <= (rect.y + rect.height);
  }

  /** Returns `true` if the given `x` and `y` coordinates are inside of this rectangle. */
  public contains(x: number, y: number): boolean {
    return Rectangle.contains(this, x, y);
  }

  /** Creates a new `Rectangle` from this one. */
  public copy(): Rectangle {
    return new Rectangle(this.width, this.height, this.x, this.y);
  }

}
