/** A constructor type that produces instances of type `T` */
export type ClassType<T = any> = new (...params: any[]) => T;

/** Basic data structure. */
export interface Struct<T = unknown> {
  [key: string]: T;
}

/**
 * A vector containing two points in a space where the first index is the x
 * axis and the second the y axis.
 */
export type Vec2 = [number, number];

/** Readonly version of `Vec2` */
export type ReadVec2 = readonly [number, number];
