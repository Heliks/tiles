/** A two-dimensional vector. */
export interface XY {
  x: number;
  y: number;
}

export class Vec2 implements XY {

  /**
   * @param x Position on x axis.
   * @param y Position on y axis.
   */
  constructor(public x = 0, public y = 0) {}

  /**
   * Returns the distance between `pointA` and `pointB`. The distance is the length of a
   * straight line connecting them.
   */
  public static distance(pointA: XY, pointB: XY): number {
    return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  }

  /**
   * Returns the distance between the vector and `point`. The distance is the length of a
   * straight line connecting them.
   */
  public distance(point: XY): number {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }

  /** Returns the vectors magnitude (length). */
  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /** Normalizes this vector. */
  public normalize(): this {
    const magnitude = this.magnitude();

    this.x /= magnitude;
    this.y /= magnitude;

    return this;
  }

  /** Returns a copy of this vector. */
  public copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /** Scales this vector by the given `factor`. */
  public scale(factor: number): this {
    this.x *= factor;
    this.y *= factor;

    return this;
  }

}
