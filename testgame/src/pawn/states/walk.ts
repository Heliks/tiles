import { State, StateMachine } from '@heliks/tiles-engine';
import { KeyCode } from '../../input';
import { isShooting, ShootArrow } from './shoot-arrow';
import { Dodge, isDodging } from './dodge';
import { PawnBlackboard } from '../pawn-blackboard';
import { isAttacking, MeleeAttack } from './melee-attack';

export class WalkState implements State<PawnBlackboard> {

  /** @inheritDoc */
  update(state: StateMachine<PawnBlackboard>): void {
    const { animation, input } = state.data;

    // Check if movement was canceled in favor of engaging in combat.
    if (isShooting(state)) {
      state.switch(new ShootArrow());

      return;
    }

    if (isDodging(state)) {
      state.switch(new Dodge());

      return;
    }

    if (isAttacking(state.data)) {
      state.switch(new MeleeAttack());

      return;
    }

    let vx = 0;
    let vy = 0;

    // Characters movement velocity adjusted to frame rate.
    const velocity = 5;

    // Move left
    if (input.isKeyDown(KeyCode.A)) {
      animation.play('walk-right').flip(true);
      vx -= velocity;
    }
    // Move right
    else if (input.isKeyDown(KeyCode.D)) {
      animation.play('walk-right').flip(false);
      vx += velocity;
    }

    // Move up
    if (input.isKeyDown(KeyCode.W)) {
      animation.play('walk-up');
      vy -= velocity;
    }
    // Move down
    else if (input.isKeyDown(KeyCode.S)) {
      animation.play('walk-down');
      vy += velocity;
    }

    // If the character is moving we transform its velocity, otherwise
    // we exit the state as we are no longer moving.
    if (vx !== 0 || vy !== 0) {
      state.data.body.setVelocity(vx, vy);
    }
    else {
      state.pop();
    }
  }

}
