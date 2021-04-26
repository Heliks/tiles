import { Behavior, MonoBehavior } from '../modules/behavior';
import { Entity, Transform, World, Vec2, Ticker } from '@heliks/tiles-engine';
import { rand } from '@heliks/tiles-engine';
import { Movement } from '../movement-system';
import { RigidBody } from '@heliks/tiles-physics';
import { VISION_COLLIDER_TYPE } from '../vision';
import { SpriteAnimation } from '@heliks/tiles-pixi';
import { getRandomPointInCircle } from '@heliks/tiles-math';


/** @internal */
const enum CritterState {
  /** Critter currently just sits around doing nothing. */
  IDLE,
  /** Critter is aimlessly wandering around. */
  WANDERING
}

/** */
export class CritterBlackboard {

  /**
   * Current state.
   */
  public state = CritterState.IDLE;

  /**
   * After the critter enters IDLE mode a count-down is started until he picks a
   * random position to aimlessly wander to.
   */
  public idleTimer = 0;

}

export class CritterBehavior implements MonoBehavior<CritterBlackboard> {

  /** @inheritDoc */
  public update(entity: Entity, behavior: Behavior<CritterBlackboard>, world: World): void {
    const transform = world.storage(Transform).get(entity);
    const movement = world.storage(Movement).get(entity);

    switch (behavior.data.state) {
      case CritterState.IDLE:
        if (behavior.data.idleTimer <= 0) {
          behavior.data.state = CritterState.WANDERING;

          // Plot a route.
          const position = getRandomPointInCircle(1, 5);

          position.x += transform.world.x;
          position.y += transform.world.y;

          movement.target = position;
        }
        else {
          behavior.data.idleTimer -= world.get(Ticker).delta;
        }
        break;
      case CritterState.WANDERING:
        if (!movement.target) {
          behavior.data.idleTimer = 2500;
          behavior.data.state = CritterState.IDLE;
        }

        break;
    }

  }

}
