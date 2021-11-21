import { Vec2 } from './vec2';

/** Boundaries of a rectangle. */
export interface RectangleBounds extends Vec2 {
  width: number;
  height: number;
}

/** A rectangle shape. */
export class Rectangle implements RectangleBounds {

  /**
   * @param width The rectangles width.
   * @param height The rectangles height.
   * @param x (optional) Position on x axis.
   * @param y (optional) Position on y axis.
   */
  constructor(
    public width: number,
    public height: number,
    public x = 0,
    public y = 0
  ) {}

  /** Creates a new `Rectangle` from this one. */
  public copy(): Rectangle {
    return new Rectangle(this.width, this.height, this.x, this.y);
  }

}
