import { atan2, DEG90_RAD, rad2deg, Vec2Readonly } from '@heliks/tiles-engine';

/** Available Cardinal directions. */
export enum CardinalDirection {
  North,
  East,
  South,
  West
}

/** Map for converting radians to cardinal directions. */
const CARDINAL_DIRECTION_MAP = [
  CardinalDirection.North,
  CardinalDirection.East,
  CardinalDirection.South,
  CardinalDirection.West
];

export class Direction {

  /**
   * @param rad The direction in which the entity is facing in radians.
   */
  constructor(public rad = 0) {}

  /** Returns the current direction in degrees. */
  public degrees(): number {
    return rad2deg(this.rad);
  }

  /**
   * Updates the current direction based on a `target` that is observed from the
   * point of `origin`.
   */
  public lookAt(origin: Vec2Readonly, target: Vec2Readonly): this {
    this.rad = atan2(target[1] - origin[1], target[0] - origin[0]);

    return this;
  }

  /** Converts the direction into a `CardinalDirection` */
  public toCardinal(): CardinalDirection {
    return CARDINAL_DIRECTION_MAP[Math.ceil(this.rad / DEG90_RAD  + Math.PI) % 4];
  }

}

