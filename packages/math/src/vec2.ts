/** A two-dimensional vector. */
export interface Vec2 {
  x: number;
  y: number;
}

/** Utility to create a `Vec2`. */
export function vec2(x: number, y: number): Vec2 {
  return {
    x,
    y
  };
}

export function vec2copy(vec: Vec2): Vec2 {
  return vec2(vec.x, vec.y);
}

/**
 * Returns the distance between two points `vecA` and `vecB`. The distance is the
 * length of a straight line connecting them.
 */
export function vec2dist(vecA: Vec2, vecB: Vec2): number {
  return Math.hypot(vecB.x - vecA.x, vecB.y - vecA.y);
}

/** Returns the magnitude (length) of a vector. */
export function vec2mag(vec: Vec2): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

// /** Returns the Dot product of two 2D vectors `vecA` and `vecB`. */
// export function vec2dot(vecA: Vec2Readonly, vecB: Vec2Readonly): number {
//   return (vecA[0] * vecB[0]) + (vecA[1] * vecB[1]);
// }
