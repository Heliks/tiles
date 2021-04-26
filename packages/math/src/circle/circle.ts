/** A circle shape. */
export class Circle {

  /**
   * @param radius The radius of the circle.
   * @param x (optional) Position on x axis.
   * @param y (optional) Position on y axis.
   */
  constructor(public radius: number, public x = 0, public y = 0) {}

  /** Creates a new `Rectangle` from this one. */
  public copy(): Circle {
    return new Circle(this.radius, this.x, this.y);
  }

}
