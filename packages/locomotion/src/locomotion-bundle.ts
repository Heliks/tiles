import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { Avoidance, Seek, Wander } from './behaviors';
import { Locomotion } from './locomotion';
import { LocomotionSystem } from './locomotion-system';


/**
 * This bundle provides functionality to move entities using steering forces.
 *
 * To enable locomotion, add {@link Locomotion} component with a {@link SteeringBehavior}
 * to an entity with both a {@link Transform} and {@link RigidBody}:
 *
 * ```ts
 *  // Create an entity that wanders around autonomously.
 *  world
 *    .create()
 *    .use(new Locomotion(new Wander()))
 *    .use(new RigidBody().collider(...))
 *    .use(new Transform(0, 0))
 *    .build();
 * ```
 *
 * Available steering behaviors are:
 *
 *  - {@link Avoidance}
 *  - {@link Seek}
 *  - {@link Wander}
 */
export class LocomotionBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .type(Locomotion)
      .type(Avoidance)
      .type(Seek)
      .type(Wander)
      .system(LocomotionSystem);
  }

}
