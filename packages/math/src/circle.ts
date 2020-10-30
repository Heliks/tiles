/** Conversion factor for degrees to radians. */
export const DEG2RAD_FACTOR = Math.PI / 180;

/** Conversion factor for radians to degrees. */
export const RAD2DEG_FACTOR = 180 / Math.PI;

/** 90 degrees in radians. */
export const DEG90_RAD = 1.5708;

/** Double of PI */
export const PI_2 = Math.PI * 2;

/** Converts the given `value` of radians to degrees. */
export function rad2deg(value: number): number {
  return value * RAD2DEG_FACTOR;
}

/** Converts the given `value` of degrees to radians. */
export function deg2rad(value: number): number {
  return value * DEG2RAD_FACTOR;
}

/**
 * Returns the angle (in radians) from the x axis to a point. Unlike `Math.atan2` this
 * assumes a grid where the y axis points down instead of up.
 */
export function atan2(y: number, x: number): number {
  return Math.atan2(y, x) + DEG90_RAD;
}

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
