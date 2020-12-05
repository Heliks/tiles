import { State, StateMachine } from '@heliks/tiles-engine';
import { KeyCode } from '../../input';
import { PawnBlackboard } from '../pawn-blackboard';
import { WalkState } from './walk';
import { Dodge, isDodging } from './dodge';
import { isShooting, ShootArrow } from './shoot-arrow';
import { CardinalDirection } from '../../components';
import { isAttacking, MeleeAttack } from './melee-attack';

/** @internal */
function playAnimation(pawn: PawnBlackboard): void {
  const direction = pawn.direction.toCardinal();

  switch (direction) {
    case CardinalDirection.West:
      pawn.animation.play('idle-right').flip(true);
      break;
    case CardinalDirection.East:
      pawn.animation.play('idle-right');
      break;
    case CardinalDirection.North:
      pawn.animation.play('idle-up');
      break;
    case CardinalDirection.South:
      pawn.animation.play('idle-down');
      break;
  }
}

export class Idle implements State<PawnBlackboard> {

  /** @inheritDoc */
  public onStart(data: PawnBlackboard): void {
    playAnimation(data);
  }

  /** @inheritDoc */
  public onResume(data: PawnBlackboard): void {
    playAnimation(data);
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnBlackboard>): void {
    const { input } = state.data;

    // Check if character should move, if so enter the walking state.
    if (
      input.isKeyDown(KeyCode.A) ||
      input.isKeyDown(KeyCode.D) ||
      input.isKeyDown(KeyCode.W) ||
      input.isKeyDown(KeyCode.S)
    ) {
      state.push(new WalkState());
    }

    if (isDodging(state)) {
      state.push(new Dodge());

      return;
    }

    if (isShooting(state)) {
      state.push(new ShootArrow());

      return;
    }

    if (isAttacking(state.data)) {
      state.push(new MeleeAttack());

      return;
    }
  }

}
