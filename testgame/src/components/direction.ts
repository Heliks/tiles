import { atan2, DEG90_RAD, rad2deg, Vec2 } from '@heliks/tiles-engine';

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
  public lookAt(origin: Vec2, target: Vec2): this {
    this.rad = atan2(target.y - origin.y, target.x - origin.x);

    return this;
  }

  /** Converts the direction into a `CardinalDirection` */
  public toCardinal(): CardinalDirection {
    return CARDINAL_DIRECTION_MAP[Math.ceil(this.rad / DEG90_RAD  + Math.PI) % 4];
  }

}

