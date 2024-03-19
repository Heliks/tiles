/** Trims `char` characters on the left side of the string `value`. */
export function ltrim(value: string, char: string): string {
  return value.replace(new RegExp(`^${char}+`, ''), '');
}

/** Trims `char` characters on the right side of the string `value`. */
export function rtrim(value: string, char: string): string {
  return value.replace(new RegExp(`${char}*$`), '');
}

/** Returns `true` if `target` contains all items in `items`. */
export function containsAll<T = unknown>(target: T[], items: T[]): boolean {
  return items.every(i => target.includes(i));
}

/**
 * Creates an array with a length of `size` and pre-fills it with the given `value`.
 *
 * ```ts
 * // ['bar', 'bar', 'bar']
 * const foo = createPackedArray(3, 'bar');
 * ```
 */
export function createPackedArray<T>(size: number, value: T): T[] {
  const data: T[] = [];

  for (let i = 0, l = size; i < l; i++) {
    data.push(value);
  }

  return data;
}

/** Randomizes the contents of an array. */
export function shuffle<T>(array: T[]): T[] {
  let r;
  let t;

  // Simple Durstenfeld shuffle.
  for (let i = array.length - 1; i > 0; i--) {
    r = Math.floor(Math.random() * (i + 1));
    t = array[i];

    array[i] = array[r];
    array[r] = t;
  }

  return array;
}

export function isDefined<T>(value?: T): value is T {
  return value !== undefined && value !== null;
}
