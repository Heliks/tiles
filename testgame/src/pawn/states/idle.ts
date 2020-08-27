import { State, StateMachine } from '@heliks/tiles-engine';
import { SpriteAnimation } from '@heliks/tiles-pixi';
import { KeyCode } from '../../input';
import { PawnStateData } from '../utils';
import { WalkState } from './walk';
import { Dodge, isDodging } from './dodge';
import { isShooting, ShootArrow } from './shoot-arrow';
import { CardinalDirection } from '../../components/direction';

export class Idle implements State<StateMachine<PawnStateData>> {

  /** Plays the Idle animation for the appropriate `direction`. */
  public play(animation: SpriteAnimation, direction: CardinalDirection): void {
    switch (direction) {
      case CardinalDirection.West:
        animation.play('idle-left');
        break;
      case CardinalDirection.East:
        animation.play('idle-right');
        break;
      case CardinalDirection.North:
        animation.play('idle-up');
        break;
      case CardinalDirection.South:
        animation.play('idle-down');
        break;
    }
  }

  /** @inheritDoc */
  public onStart(state: StateMachine<PawnStateData>): void {
    this.play(state.data.animation, state.data.pawn.direction);
  }

  /** @inheritDoc */
  public onResume(state: StateMachine<PawnStateData>): void {
    this.play(state.data.animation, state.data.pawn.direction);
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnStateData>): void {
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
