import { State, StateMachine, DEG90_RAD } from '@heliks/tiles-engine';
import { PawnBlackboard } from '../pawn-blackboard';
import { KeyCode } from '../../input';
import { CardinalDirection } from '../../components';
import { SpriteAnimation } from '@heliks/tiles-pixi';

export function isDodging(state: StateMachine<PawnBlackboard>): boolean {
  return state.data.input.isKeyDownThisFrame(KeyCode.Space);
}

// Lookup table for animation names based on cardinal direction.
const ANIMATION_MAP = {
  [CardinalDirection.West]: 'dodge-left',
  [CardinalDirection.East]: 'dodge-right',
  [CardinalDirection.North]: 'dodge-up',
  [CardinalDirection.South]: 'dodge-down'
};

// Time in MS how long the entity is accelerated during the dodge.
const ACCELERATION_TIME_MS = 200;

// The force that is applied to the entity during the acceleration.
const ACCELERATION_FORCE = 15;

/** @internal */
function playAnimation(pawn: PawnBlackboard): void {
  const direction = pawn.direction.toCardinal();

  switch (direction) {
    case CardinalDirection.West:
      pawn.animation.play('roll-right').flip(true);
      break;
    case CardinalDirection.East:
      pawn.animation.play('roll-right');
      break;
    case CardinalDirection.North:
      pawn.animation.play('roll-up');
      break;
    case CardinalDirection.South:
      pawn.animation.play('roll-up').flip(false, true);
      break;
  }
}

/** Accelerates an entity in the direction in which it is currently facing. */
export class Dodge implements State<PawnBlackboard> {

  /** @internal */
  private isDodging = false;

  /** Velocity to apply during the acceleration on x axis. */
  private vx = 0;

  /** Velocity to apply during the acceleration on y axis. */
  private vy = 0;

  /** Remaining amount of the of the entity acceleration. */
  private acceleration = ACCELERATION_TIME_MS;

  public onStart(data: PawnBlackboard): void {
    // Play dodge animation that fits the direction in which the entity is dodging.
    playAnimation(data);

    this.vx = Math.sin(data.transform.rotation) * ACCELERATION_FORCE;
    this.vy = -Math.cos(data.transform.rotation) * ACCELERATION_FORCE;
  }

  /** @inheritDoc */
  public update(state: StateMachine<PawnBlackboard>, data: PawnBlackboard): void {
    if (data.animation.isComplete()) {
      state.pop();

      return;
    }

    if (this.acceleration > 0) {
      this.acceleration -= data.ticker.delta;

      // Accelerate entity.
      data.body.setVelocity(this.vx, this.vy);
    }
  }

}
