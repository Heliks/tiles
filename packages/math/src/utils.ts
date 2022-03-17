/** Returns a random float between `min` and `max`. */
export function rand(max: number, min = 0): number {
  return Math.random() * (max - min) + min
}

/**
 * Linear interpolation.
 * @see https://gamedevbeginner.com/the-right-way-to-lerp-in-unity-with-examples/
 */
export function lerp(v1: number, v2: number, t: number): number {
  return v1 * (1 - t) + v2 * t
}


