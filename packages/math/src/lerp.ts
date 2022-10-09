/**
 * Performs an interpolation on a linear scale from `a` to `b`.
 *
 * Linear interpolation returns a value in a known range (a & b). For example, a value
 * between 0 and 100. The value is defined by the interpolation point `t`, which is a
 * float between 0 and 1.
 *
 * ```ts
 * console.log(lerp(100, 150, 0.5)); // 125
 * console.log(lerp(500, 900, 0.5)); // 700
 * ```
 */
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

/** @see https://easings.net/#easeIn */
export function easeIn(t: number): number {
  return t * t;
}

/** @see https://easings.net/#easeOut */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** @see https://easings.net/#easeOutBounce */
export function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  }
  else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  }
  else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  }
  else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}
