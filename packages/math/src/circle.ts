/** A circle shape. */
export class Circle {

  /**
   * @param radius The radius of the circle.
   * @param x (optional) Position on x axis.
   * @param y (optional) Position on y axis.
   */
  constructor(public radius: number, public x = 0, public y = 0) {}

  /** Creates a new `Circle` from this one. */
  public copy(): Circle {
    return new Circle(this.radius, this.x, this.y);
  }

  /** Scales the circle by the given `factor`. */
  public scale(factor: number): this {
    this.radius *= factor;

    return this;
  }

}
