/** Returns a random float between `min` and `max`. */
export function rand(max: number, min = 0): number {
  return Math.random() * (max - min) + min
}
