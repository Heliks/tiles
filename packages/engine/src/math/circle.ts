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

/** Converts the given `value` if degrees to radians. */
export function deg2rad(value: number): number {
  return value * DEG2RAD_FACTOR;
}
