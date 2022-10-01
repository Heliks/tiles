import { XY } from './vec2';


/**
 * Possible cardinal directions on an 8-sided compass.
 */
export enum Compass {
  N,
  E,
  S,
  W,
  NE,
  NW,
  SW,
  SE
}

/**
 * Contains the compass directions ordered clockwise, mapping each value to a position on
 * the compass. The first value is east, because in circle math we start counting circle
 * positions (a.E. sinus and cosinus) from the right of the circle center.
 *
 * @see Compass
 */
const VALUES = [
  Compass.E,
  Compass.SE,
  Compass.S,
  Compass.SW,
  Compass.W,
  Compass.NW,
  Compass.N,
  Compass.NE
];

/** @internal */
const PI_2 = Math.PI * 2;

/**
 * Converts the unit vector `point` to a compass direction.
 *
 * @see Compass
 */
export function vecToCompass(point: XY): Compass {
  const angle = Math.atan2(point.y, point.x);
  const octant = Math.round(8 * angle / PI_2 + 8) % 8;

  return VALUES[ octant ];
}
