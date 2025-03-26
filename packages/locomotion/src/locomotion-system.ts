import { ProcessingSystem, Query, QueryBuilder, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import { Locomotion } from './locomotion';


/** Applies {@link Locomotion} to an entities {@link RigidBody}. */
export class LocomotionSystem extends ProcessingSystem {

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(Locomotion)
      .contains(RigidBody)
      .contains(Transform)
      .build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies = world.storage(RigidBody);
    const locomotions = world.storage(Locomotion);
    const transforms = world.storage(Transform);

    for (const entity of this.query.entities) {
      const locomotion = locomotions.get(entity);

      if (locomotion.disabled) {
        continue;
      }

      const body = bodies.get(entity);
      const transform = transforms.get(entity);

      if (locomotion.behavior) {
        locomotion.direction.copy(body.getVelocity());

        const force = locomotion.behavior.update(world, locomotion, transform);

        // Apply movement speed.
        force.scale(locomotion.speed)

        // Apply force to body, limited by current locomotion speed.
        body.applyForce(
          force.x,
          force.y
        );
      }
    }
  }

}
