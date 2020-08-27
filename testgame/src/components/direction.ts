import { rad2deg, Vec2Readonly } from '@heliks/tiles-engine';

/** 90 degrees in radians. */
const DEG90_RAD = 1.5708;

/** Available Cardinal directions. */
export enum CardinalDirection {
  North,
  East,
  South,
  West
}

/** Map for converting radians to cardinal directions. */
const CARDINAL_DIRECTION_MAP = [
  CardinalDirection.South,
  CardinalDirection.East,
  CardinalDirection.North,
  CardinalDirection.West
];

export class Direction {

  /**
   * @param rad The direction in which the entity is facing in radians.
   */
  constructor(public rad = 0) {}

  /**
   * Updates the current direction based on a `target` that is observed from the
   * point of `origin`.
   */
  public transform(origin: Vec2Readonly, target: Vec2Readonly): this {
    this.rad = DEG90_RAD - Math.atan2(target[1] - origin[1], target[0] - origin[0]);

    return this;
  }

  /** Converts the direction into a `CardinalDirection` */
  public toCardinal(): CardinalDirection {
    return CARDINAL_DIRECTION_MAP[Math.ceil(this.rad / DEG90_RAD  + Math.PI) % 4];
  }

}

