/** Returns a random integer between the range `max` and `min`. */
export function getRandomInt(max: number, min = 0): number {
  const _min = Math.ceil(min);

  return Math.floor(Math.random() * (Math.floor(max) - _min + 1)) + _min;
}
