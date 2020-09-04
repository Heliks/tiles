/**
 * A vector containing two points in a space where the first index is the x axis and
 * the second the y axis.
 */
export type Vec2 = [number, number];

/** Readonly version of `Vec2` */
export type Vec2Readonly = readonly [number, number];

/** Returns the Dot product of two 2D vectors `vecA` and `vecB`. */
export function vec2dot(vecA: Vec2Readonly, vecB: Vec2Readonly): number {
  return (vecA[0] * vecB[0]) + (vecA[1] * vecB[1]);
}
