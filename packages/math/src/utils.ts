/** Caps `value` to the boundaries `min` and `max`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
