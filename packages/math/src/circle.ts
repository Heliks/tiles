import { Shape } from './shape';


/** A circle shape. */
export class Circle implements Shape {

  /**
   * @param radius The radius of the circle.
   * @param x (optional) Position on x axis.
   * @param y (optional) Position on y axis.
   */
  constructor(public radius: number, public x = 0, public y = 0) {}

  /** @inheritDoc */
  public copy(): Circle {
    return new Circle(this.radius, this.x, this.y);
  }

  /** @inheritDoc */
  public scale(factor: number): this {
    this.radius *= factor;

    return this;
  }

}
