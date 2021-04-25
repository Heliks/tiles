import { Behavior, MonoBehavior } from '../modules/behavior';
import { Entity, Transform, World, Vec2, Ticker } from '@heliks/tiles-engine';
import { rand } from '@heliks/tiles-engine';
import { Movement } from '../movement-system';
import { RigidBody } from '@heliks/tiles-physics';
import { VISION_COLLIDER_TYPE } from '../vision';
import { SpriteAnimation } from '@heliks/tiles-pixi';

function getRandomPointInCircle(minRadius: number, maxRadius: number): Vec2 {
  const r = rand(minRadius, maxRadius);
  const t = rand(1, 360);

  console.log(r, t)

  return {
    x: Math.sqrt(r) * Math.cos(t),
    y: Math.sqrt(r) * Math.sin(t)
  };
}

const enum TortoiseState {
  IDLE,
  WANDERING,
  BLOCK
}

export class TortoiseBlackboard {
  public state = TortoiseState.IDLE;
  public idleTimer = 0;
}

function getVisibleEntities(body: RigidBody): Set<Entity> {
  const entities = new Set<Entity>();

  for (const collider of body.colliders) {
    if (collider.type === VISION_COLLIDER_TYPE) {
      for (const contact of collider.contacts) {
        entities.add(contact.entity);
      }
    }
  }

  return entities;
}

/**
 *
 */
export class TortoiseBehavior implements MonoBehavior<TortoiseBlackboard> {

  /** @inheritDoc */
  public update(
    entity: Entity,
    behavior: Behavior<TortoiseBlackboard>,
    world: World
  ): void {

    const transform = world.storage(Transform).get(entity);
    const movement = world.storage(Movement).get(entity);

    // If an enemy is nearby go into defensive mode.
    const body = world.storage(RigidBody).get(entity);
    const hostiles = getVisibleEntities(body);

    // If there are any hostile entities in the area we enter block mode regardless
    // of the current state (unless we are already blocking).
    if (behavior.data.state !== TortoiseState.BLOCK && hostiles.size > 0) {
      behavior.data.state = TortoiseState.BLOCK;

      movement.cancel();

      world
        .storage(SpriteAnimation)
        .get(entity)
        .play('block', false);
    }

    switch (behavior.data.state) {
      // Idle.
      case TortoiseState.IDLE:
        if (behavior.data.idleTimer <= 0) {
          behavior.data.state = TortoiseState.WANDERING;

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
      // Wandering around.
      case TortoiseState.WANDERING:
        if (!movement.target) {
          behavior.data.idleTimer = 2500;
          behavior.data.state = TortoiseState.IDLE;
        }

        break;
      case TortoiseState.BLOCK:
        // Exit blocking state if there are no more hostile entities in the area.
        if (hostiles.size === 0) {
          behavior.data.idleTimer = 1000;
          behavior.data.state = TortoiseState.IDLE;

          // Play idle animation.
          world.storage(SpriteAnimation).get(entity).play('idle');
        }

        break;
    }

  }

}
