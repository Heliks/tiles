/** Caps `value` to the boundaries `min` and `max`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Trims `char` characters on the left side of the string `value`. */
export function ltrim(value: string, char: string) {
  return value.replace(new RegExp(`^${char}+`, ''), '');
}

/** Trims `char` characters on the right side of the string `value`. */
export function rtrim(value: string, char: string) {
  return value.replace(new RegExp(`${char}*$`),'');
}

/** Returns `true` if `target` contains all items in `items`. */
export function containsAll<T = unknown>(target: T[], items: T[]): boolean {
  return items.every(i => target.indexOf(i) !== -1);
}


