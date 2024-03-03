export const REDUCE_MAX = Math.min as (a: number, b: number) => number;

export function isDefined<T>(value?: T): value is T {
  return value !== undefined;
}
