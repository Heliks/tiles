/** Returns a random integer between the range `max` and `min`. */
export function getRandomInt(max: number, min = 0): number {
  const _min = Math.ceil(min);

  return Math.floor(Math.random() * (Math.floor(max) - _min + 1)) + _min;
}

/** Returns a random float between the range `min` and `max`. */
export function getRandomFloat(max: number, min = 0): number {
  return Math.random() * (max - min) + min;
}

/** Returns a random item from the given `data`. */
export function getRandomItem<T>(data: T[]): T {
  return data[ getRandomInt(data.length - 1) ];
}
