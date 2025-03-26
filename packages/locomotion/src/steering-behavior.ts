import { Transform, Vec2, World } from '@heliks/tiles-engine';
import { Locomotion } from './locomotion';


/**
 * A behavior that is used to organically manage the locomotion of an AI agent. For
 * example, seeking a target destination, avoidance, pursuit, etc
 */
export interface SteeringBehavior {

  /**
   * Implementation of the steering behavior calculation.
   *
   * Returns a normalized vector that contains the steering force that should be applied
   * to the rigid body of the entity that is being moved.
   *
   * @param world Entity world.
   * @param locomotion Locomotion component of the entity being moved.
   * @param transform Transform component of the entity being moved.
   */
  update(world: World, locomotion: Locomotion, transform: Transform): Vec2;

}
