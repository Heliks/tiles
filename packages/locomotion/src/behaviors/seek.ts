import { Transform, TypeId, Vec2, World } from '@heliks/tiles-engine';
import { Locomotion } from '../locomotion';
import { SteeringBehavior } from '../steering-behavior';


/**
 * Seek moves the entity from its current position to a target position in a straight
 * line. When the target position is reached, the entity stops.
 */
@TypeId('tiles_locomotion_seek')
export class Seek implements SteeringBehavior {

  /** Last known distance left to target. */
  private distance = Infinity;

  /** @internal */
  private readonly scratch = new Vec2(0, 0);

  /**
   * @param x Target position along x-axis.
   * @param y Target position along y-axis.
   */
  constructor(public x = 0, public y = 0) {}

  /** Returns `true` when the entity has arrived at the desired position. */
  public arrived(): boolean {
    return Math.floor(this.distance * 10) === 0;
  }

  /** @inheritDoc */
  public update(world: World, movement: Locomotion, transform: Transform): Vec2 {
    if (this.arrived()) {
      this.scratch.set(0, 0)
    }
    else {
      this.scratch.copy(this).sub(transform.world);
    }

    this.distance = this.scratch.magnitude();

    return this.scratch.normalize();
  }

}
