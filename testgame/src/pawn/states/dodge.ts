import { State, StateMachine } from '@heliks/tiles-engine';
import { getMovementVelocity, PawnStateData } from '../utils';
import { KeyCode } from '../../input';
import { CardinalDirection } from '../../components/direction';

export function isDodging(state: StateMachine<PawnStateData>) {
  return state.data.input.isKeyDown(KeyCode.E);
}

export class Dodge implements State<StateMachine<PawnStateData>> {

  /** @internal */
  private isDodging = false;

  /** @inheritDoc */
  public update(state: StateMachine<PawnStateData>): void {
    const { animation, pawn } = state.data;

    if (this.isDodging) {
      if (animation.isComplete()) {
        state.pop();
      }

      return;
    }

    let vx = 0;
    let vy = 0;

    const velocity = getMovementVelocity(pawn.speed * 12, state.data.ticker.delta);

    switch (state.data.pawn.direction) {
      case CardinalDirection.West:
        animation.play('dodge-left');
        vx -= velocity;
        break;
      case CardinalDirection.East:
        animation.play('dodge-right');
        vx += velocity;
        break;
      case CardinalDirection.North:
        animation.play('dodge-up');
        vy -= velocity;
        break;
      case CardinalDirection.South:
        animation.play('dodge-down');
        vy += velocity;
        break;
    }

    state.data.body.transformVelocity(vx, vy);

    this.isDodging = true;
  }

}
