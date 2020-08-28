/** Returns a random int between `min` and `max`. */
export function rand(max: number, min = 0): number {
  return Math.random() * (max - min + 1) + min
}

