import { TypeId, Vec2 } from '@heliks/tiles-engine';
import { SteeringBehavior } from './steering-behavior';


/**
 * Component that moves the world position of the entity to which it is attached to
 * using a steering force.
 */
@TypeId('tiles_locomotion')
export class Locomotion {

  /** Unit vector that points into the direction that the entity is currently facing. */
  public direction = new Vec2(0, 0);

  /**
   * If set to `true`, the entity will not be moved. This only concerns movement caused
   * by locomotion, which means that it can still be moved manually.
   */
  public disabled = false;

  /**
   * @param behavior Steering behavior used for locomotion.
   * @param speed Speed multiplier for locomation forces.
   */
  constructor(public behavior?: SteeringBehavior, public speed = 1) {}

  /** Clears any current locomotion behaviors. */
  public clear(): this {
    this.behavior = undefined;

    return this;
  }

}

