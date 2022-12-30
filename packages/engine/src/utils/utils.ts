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
