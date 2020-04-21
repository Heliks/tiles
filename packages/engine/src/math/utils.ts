/** Converts the given `value` of radians to degrees. */
export function rad2deg(value: number): number {
  return value * 180 / Math.PI;
}

/** Converts the given `value` if degrees to radians. */
export function deg2rad(value: number): number {
  return value * Math.PI / 180;
}
