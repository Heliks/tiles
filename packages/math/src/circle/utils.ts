import { rand } from '../utils';
import { Vec2 } from '../vec2';

/** Conversion factor for degrees to radians. */
export const DEG2RAD_FACTOR = Math.PI / 180;

/** Conversion factor for radians to degrees. */
export const RAD2DEG_FACTOR = 180 / Math.PI;

/** 90 degrees in radians. */
export const DEG90_RAD = 1.5708;

/** Double of PI */
export const PI_2 = Math.PI * 2;

/** Converts the given `value` of radians to degrees. */
export function rad2deg(value: number): number {
  return value * RAD2DEG_FACTOR;
}

/** Converts the given `value` of degrees to radians. */
export function deg2rad(value: number): number {
  return value * DEG2RAD_FACTOR;
}


/**
 * Returns a random position that fits inside of a circle. The center of the circle
 * is always 0/0.
 *
 * @param minRadius Position must be this radius away from the circles center.
 * @param maxRadius Position must be inside of this radius away from the circles center.
 */
export function getRandomPointInCircle(minRadius: number, maxRadius: number): Vec2 {
  const r = rand(minRadius, maxRadius);
  const t = rand(1, 360);

  return {
    x: Math.sqrt(r) * Math.cos(t),
    y: Math.sqrt(r) * Math.sin(t)
  };
}
