/** Converts the given `value` of radians to degrees. */
export function rad2deg(value: number): number {
  return value * 180 / Math.PI;
}

/** Converts the given `value` if degrees to radians. */
export function deg2rad(value: number): number {
  return value * Math.PI / 180;
}

/** Returns a random int between `min` and `max`. */
export function rand(max: number, min = 0): number {
  return Math.random() * (max - min + 1) + min
}
