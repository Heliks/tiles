import { State, StateMachine, vec2 } from '@heliks/tiles-engine';
import { Arrow, shootArrow } from '../../arrow';
import { PawnBlackboard } from '../pawn-blackboard';
import { KeyCode } from '../../input';
import { CardinalDirection } from '../../components';
import { Dodge, isDodging } from './dodge';

/** @internal */
function playAnimation(pawn: PawnBlackboard): void {
  const direction = pawn.direction.toCardinal();

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
  }
}

export function isShooting(state: StateMachine<PawnBlackboard>) {
  return state.data.input.isKeyDown(KeyCode.Q) && state.data.pawn.canCast();
}

export class ShootArrow implements State<PawnBlackboard> {

  protected duration = 600;
  protected casting = true;

  /** @inheritDoc */
  public onStart(state: StateMachine<PawnBlackboard>): void {
    const { animation, pawn } = state.data;

    // Add a cool-down so the pawn can't shoot the arrow again right away.
    // Todo: Should be handled via a status system or smth.
    pawn.cooldown = 500;

    // Play animation.
    playAnimation(state.data);
  }

  /** @inheritDoc */
  public onResume(state: StateMachine<PawnBlackboard>): void {
    state.pop();
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnBlackboard>): unknown {
    const { world, pawn } = state.data;

    this.duration -= state.data.ticker.delta;

    // Allow player to break out of animation (e.g. something like orb-walking from
    // Dota or LoL) or to cancel the arrow attack.
    if (isDodging(state)) {
      return state.switch(new Dodge());
    }

    if (this.duration <= 300 && this.casting) {
      let { x, y } = state.data.transform.world;

      // Offset the position from where we fire the arrow slightly so that it does not
      // spawn inside of the pawns body.
      switch (pawn.direction) {
        case CardinalDirection.West:
          x -= 0.5;
          y -= 0.3;
          break;
        case CardinalDirection.East:
          x += 0.5;
          y -= 0.3;
          break;
      }

      shootArrow(world, state.data.transform, new Arrow(state.data.entity, vec2(2, 6)));

      // Arrow was show, prevent it from shooting again.
      this.casting = false;
    }

    if (this.duration <= 0) {
      // Exit the current state.
      state.pop();
    }
  }

}
