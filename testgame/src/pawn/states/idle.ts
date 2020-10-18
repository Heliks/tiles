import { State, StateMachine } from '@heliks/tiles-engine';
import { KeyCode } from '../../input';
import { PawnBlackboard } from '../pawn-blackboard';
import { WalkState } from './walk';
import { Dodge, isDodging } from './dodge';
import { isShooting, ShootArrow } from './shoot-arrow';
import { CardinalDirection } from '../../components';

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
  public onStart(state: StateMachine<PawnBlackboard>): void {
    playAnimation(state.data);
  }

  /** @inheritDoc */
  public onResume(state: StateMachine<PawnBlackboard>): void {
    playAnimation(state.data);
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
    }

    if (isShooting(state)) {
      state.push(new ShootArrow());

      return;
    }
  }

}
