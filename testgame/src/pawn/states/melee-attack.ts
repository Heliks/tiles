import { DEG90_RAD, Circle, Entity, State, StateMachine, Rectangle, Transform, vec2, World } from '@heliks/tiles-engine';
import { KeyCode } from '../../input';
import { PawnBlackboard } from '../pawn-blackboard';
import { RigidBody } from '@heliks/tiles-physics';
import { CollisionGroups } from '../../const';
import { Arrow } from '../../arrow';
import { ShapeDisplay, ShapeKind } from '@heliks/tiles-pixi';
import { Combat } from '../../combat';
import { Dodge, isDodging } from './dodge';

/** Force that is applied to the entity that performs the melee swing. */
const MELEE_ATTACK_SWING_FORCE = 3;
const MELEE_ATTACK_SWING_TIME = 300;

/** */
export function isAttacking(pawn: PawnBlackboard): boolean {
  return pawn.input.isKeyDownThisFrame(KeyCode.MouseLeft);
}

/** @internal */
function playAnimation(pawn: PawnBlackboard, combo: number): void {
  const direction = pawn.direction.toCardinal();

  switch (combo) {
    case 0:
      pawn.animation.play('sword_down1', false);
      break;
    case 1:
      pawn.animation.play('sword_down2', false);
      break;
  }
}

/** Shoots an `arrow` in `direction` from the `x` and `y` position. */
export function spawnHurtBox(
  world: World,
  transform: Transform,
  arrow: Arrow
): Entity {
  const body = new RigidBody().attach(new Circle(0.8));

  // Only allow the body to collide with the terrain
  // Todo: Should collide with enemies too.
  body.mask = CollisionGroups.Enemy;

  const direction = transform.getDirectionVector();

  return world
    .builder()
    .use(new Transform(
      transform.world.x + (direction.x * 0.5),
      transform.world.y + (-direction.y * 0.5),
    ))
    .use(new ShapeDisplay(ShapeKind.Rect, vec2(0.5, 0.5)).fill(0xFF00FF))
    .use(arrow)
    .use(body)
    .build();
}

export class MeleeAttack implements State<PawnBlackboard> {

  /** @internal */
  private isHitBoxSpawned = false;

  /** @inheritDoc */
  public onStart(state: StateMachine<PawnBlackboard>): void {
    const { entity, transform, world } = state.data;

    const combat = world.storage(Combat).get(entity);

    if (combat.meleeAttackSwingTimer > 0) {
      state.pop();

      return;
    }

    playAnimation(state.data, combat.meleeAttackComboCounter);

    combat.meleeAttackSwingTimer = MELEE_ATTACK_SWING_TIME;

    // Simulate a forwards motion caused by the entity swinging its weapon with force
    // instead of awkwardly waving it around while fixed in place.
    state.data.body.setVelocity(
      Math.sin(transform.rotation) * MELEE_ATTACK_SWING_FORCE,
      -Math.cos(transform.rotation) * MELEE_ATTACK_SWING_FORCE
    );
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnBlackboard>): unknown {
    const { animation, entity, world } = state.data;
    const combat = world.storage(Combat).get(entity);

    if (combat.meleeAttackSwingTimer > 0) {
      return;
    }

    // After the weapon swing is complete we can spawn the actual hit-box that damages
    // that damages enemies.
    if (!this.isHitBoxSpawned) {
      spawnHurtBox(world, state.data.transform, new Arrow(entity, vec2(5, 10)));

      this.isHitBoxSpawned = true;
    }

    // Chain next attack in the combo.
    if (isAttacking(state.data)) {
      combat.increaseComboCounter();

      // Allow hitbox to be spawned again.
      this.isHitBoxSpawned = false;

      return this.onStart(state);
    }

    // Allow canceling the attack animation early by dodging.
    if (isDodging(state)) {
      return state.switch(new Dodge());
    }

    // Exit the state if animation is complete.
    if (animation.isComplete()) {
      combat.meleeAttackComboCounter = 0;

      return state.pop();
    }
  }

}
