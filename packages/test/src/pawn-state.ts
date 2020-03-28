import { FlipDirection, SpriteAnimation } from "@tiles/pixi";
import { RigidBody } from "@tiles/physics";
import { InputHandler, KeyCode } from "./input";
import { State, StateMachine, Ticker } from "@tiles/engine";

export interface PawnStateData {
  animation: SpriteAnimation;
  body: RigidBody;
  input: InputHandler;
  ticker: Ticker;
}

export class WalkState implements State<StateMachine<PawnStateData>> {

  /** Movement speed. */
  protected speed = 16;

  /** {@inheritDoc} */
  update(state: StateMachine<PawnStateData>): void {
    let velocityX = 0;
    let velocityY = 0;

    const animation = state.data.animation;

    // Characters movement velocity adjusted to frame rate.
    const velocity = this.speed / state.data.ticker.delta;

    // Horizontal movement
    if (state.data.input.isKeyDown(KeyCode.A)) {
      animation.play('walk-right').flipTo(FlipDirection.Horizontal);
      velocityX -= velocity;
    }
    else if (state.data.input.isKeyDown(KeyCode.D)) {
      animation.play('walk-right').flipTo(FlipDirection.None);
      velocityX += velocity;
    }

    // Vertical movement.
    if (state.data.input.isKeyDown(KeyCode.W)) {
      animation.play('walk-up');
      velocityY -= velocity;
    }
    else if (state.data.input.isKeyDown(KeyCode.S)) {
      animation.play('walk-down');
      velocityY += velocity;
    }

    // If the character is moving we transform its velocity, otherwise
    // we exit the state as we are no longer moving.
    if (velocityX !== 0 || velocityY !== 0) {
      state.data.body.transformVelocity(
        velocityX,
        velocityY
      );
    }
    else {
      state.pop();
    }
  }

}

export class IdleState implements State<StateMachine<PawnStateData>> {

  /** {@inheritDoc} */
  onStart(state: StateMachine<PawnStateData>): void {
    state.data.animation.setFrames([ 1 ]);
  }

  /** {@inheritDoc} */
  onResume(state: StateMachine<PawnStateData>): void {
    state.data.animation.setFrames([ 1 ]);
  }

  /** {@inheritDoc} */
  update(state: StateMachine<PawnStateData>): void {
    // Check if character should move, if so enter the walking state.
    if (
      state.data.input.isKeyDown(KeyCode.A) ||
      state.data.input.isKeyDown(KeyCode.D) ||
      state.data.input.isKeyDown(KeyCode.W) ||
      state.data.input.isKeyDown(KeyCode.S)
    ) {
      state.push(new WalkState());
    }
  }

}