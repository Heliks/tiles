/** Position of a point. */
export interface XY {
  x: number;
  y: number;
}

/** A two-dimensional vector. */
export class Vec2 implements XY {

  /**
   * @param x X-Axis.
   * @param y Y-Axis.
   */
  constructor(public x = 0, public y = 0) {}

  /**
   * Returns the distance between `pointA` and `pointB`. The distance is the length of a
   * straight line connecting them.
   */
  public static distance(pointA: XY, pointB: XY): number {
    return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  }

  /** Updates the `x` and `y` position of the vector. */
  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
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

  /** Returns the angle of the vector in radians. */
  public radians(): number {
    return Math.atan2(this.y, this.x);
  }

  /** Returns a clone of this vector. */
  public clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /** Copies `point` as the new value for this vector. */
  public copy(point: XY): this {
    this.x = point.x;
    this.y = point.y;

    return this;
  }

  /** Scales this vector by the given `factor`. */
  public scale(factor: number): this {
    this.x *= factor;
    this.y *= factor;

    return this;
  }

  /** Adds `point` to this vector. */
  public add(point: XY): this {
    this.x += point.x;
    this.y += point.y;

    return this;
  }

  /** Subtracts `point` to this vector. */
  public sub(point: XY): this {
    this.x -= point.x;
    this.y -= point.y;

    return this;
  }

  /** Returns `true` if `point` is equal to this vector. */
  public equals(point: XY): boolean {
    return this.x === point.x && this.y === point.y;
  }

  /**
   * Returns the distance between the vector and `point`. The distance is the length of a
   * straight line connecting them.
   */
  public distance(point: XY): number {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }

}
