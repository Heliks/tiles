import { Transform } from '@heliks/tiles-engine';
import { contains, ProcessingSystem, Vec2, World } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';

export class Movement {
  public target?: Vec2;

  constructor(public speed = 1) {
  }

}

export class MovementSystem extends ProcessingSystem {

  constructor() {
    super(contains(Movement, RigidBody, Transform));
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies = world.storage(RigidBody);
    const movements = world.storage(Movement);
    const transforms = world.storage(Transform);

    for (const entity of this.group.entities) {
      const body = bodies.get(entity);
      const movement = movements.get(entity);
      const transform = transforms.get(entity);

      if (movement.target) {
        if (
          Math.round(transform.world.x).toFixed(5) === Math.round(movement.target.x).toFixed(5) &&
          Math.round(transform.world.y).toFixed(5) === Math.round(movement.target.y).toFixed(5)
        ) {
          body.setVelocity(0, 0);

          movement.target = undefined;
        }
        else {
          body.setVelocity(
            (movement.target.x - transform.world.x) * movement.speed,
            (movement.target.y - transform.world.y) * movement.speed
          );
        }
      }
    }
  }

}
