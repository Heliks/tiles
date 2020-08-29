import { State, StateMachine, Vec2 } from '@heliks/tiles-engine';
import { Arrow, shootArrow } from '../../systems/arrow';
import { PawnStateData } from '../utils';
import { KeyCode } from '../../input';
import { CardinalDirection } from '../../components/direction';

/** @internal */
function getVelocity(direction: CardinalDirection): Vec2 {
  switch (direction) {
    case CardinalDirection.West:
      return [-50, 0];
    case CardinalDirection.East:
      return [50, 0];
    case CardinalDirection.North:
      return [0, -50];
    case CardinalDirection.South:
      return [0, 50];
  }
}

/** @internal */
function getAnimation(direction: CardinalDirection): string {
  switch (direction) {
    // Todo
    case CardinalDirection.North:
    case CardinalDirection.West:
      return 'bow-left';
    case CardinalDirection.East:
      return 'bow-right';
    case CardinalDirection.South:
      return 'bow-down';
  }
}

export function isShooting(state: StateMachine<PawnStateData>) {
  return state.data.input.isKeyDown(KeyCode.Q) && state.data.pawn.canCast();
}

export class ShootArrow implements State<StateMachine<PawnStateData>> {

  protected duration = 600;
  protected casting = true;

  /** @inheritDoc */
  public onStart(state: StateMachine<PawnStateData>): void {
    const { animation, pawn } = state.data;

    // Add a cool-down so the pawn can't shoot the arrow again right away.
    pawn.cooldown = 500;

    // Play animation.
    animation.reset().play(getAnimation(pawn.direction));
  }

  /** @inheritDoc */
  public onResume(state: StateMachine<PawnStateData>): void {
    state.pop();
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnStateData>): void {
    const { world, pawn } = state.data;

    this.duration -= state.data.ticker.delta;

    if (this.duration <= 300 && this.casting) {
      let { x, y } = state.data.transform;

      // Offset the position from where we fire the arrow slightly so that it does not
      // spawn inside of the pawns body.
      switch (pawn.direction) {
        case CardinalDirection.West:
          x -= 0.5;
          y -= 0.2;
          break;
        case CardinalDirection.East:
          x += 0.5;
          y -= 0.2;
          break;
      }

      shootArrow(world, x, y, state.data.direction, new Arrow(5));

      // Arrow was show, prevent it from shooting again.
      this.casting = false;
    }

    if (this.duration <= 0) {
      // Exit the current state.
      state.pop();
    }
  }

}
