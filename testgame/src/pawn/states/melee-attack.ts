import { State, StateMachine } from '@heliks/tiles-engine';
import { PawnBlackboard } from '../pawn-blackboard';
import { KeyCode } from '../../input';
import { CardinalDirection } from '../../components';

export function isAttacking(pawn: PawnBlackboard) {
  return pawn.input.isKeyDown(KeyCode.MouseLeft);
}

/** @internal */
function playAnimation(pawn: PawnBlackboard): void {
  const direction = pawn.direction.toCardinal();

  pawn.animation.play('sword-down', false);

  /*
  switch (direction) {
    case CardinalDirection.West:
      pawn.animation.play('bow-right').flip(true);
      break;
    case CardinalDirection.East:
      pawn.animation.play('bow-right');
      break;
    case CardinalDirection.North:
      pawn.animation.play('bow-up');
      break;
    case CardinalDirection.South:
      pawn.animation.play('bow-down');
      break;
  }*/
}

export class MeleeAttack implements State<PawnBlackboard> {

  public onStart(state: StateMachine<PawnBlackboard>): void {
    console.log('MELEE!')

    playAnimation(state.data);
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnBlackboard>): void {
    if (state.data.animation.isComplete()) {
      state.pop();
    }
  }

}
