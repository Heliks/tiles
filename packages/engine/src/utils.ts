import { v4, v5 } from 'uuid';


/** Caps `value` to the boundaries `min` and `max`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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
 * Namespace used to generate v5 UUIDs.
 *
 * @see uuid()
 */
const UUID_NAMESPACE = '06d8878c-8305-44f2-8bca-98b311f857dd';

/**
 * Creates a random UUID (Universally Unique Identifiers). If a `seed` is given an RFC
 * version 5 (namespace with SHA-1) UUID will be created instead.
 *
 * @see https://de.wikipedia.org/wiki/Universally_Unique_Identifier
 */
export function uuid(seed?: string | number): string {
  return (seed ? v5(seed.toString(), UUID_NAMESPACE) : v4()).toString();
}
