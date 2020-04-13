import { FlipDirection, SpriteAnimation } from "@tiles/pixi";
import { BodyPartType, RigidBody, RigidBodyType } from "@tiles/physics";
import { InputHandler, KeyCode } from "./input";
import { clamp, ProcessingSystem, State, StateMachine, Ticker, Transform, World } from "@tiles/engine";
import { CollisionGroups } from "./const";
import { Entity, Query } from "@tiles/entity-system";

export interface PawnStateData {
  animation: SpriteAnimation;
  body: RigidBody;
  input: InputHandler;
  ticker: Ticker;
  world: World;
  transform: Transform;
}

export class WalkState implements State<StateMachine<PawnStateData>> {

  /** Movement speed. */
  protected speed = 32;

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

  protected cooldown = 0;

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

    if (state.data.input.isKeyDown(KeyCode.Q) && this.cooldown <= 0) {
      this.cooldown = 500;

      const transform = new Transform(
        state.data.transform.x + 1,
        state.data.transform.y
      );

      const body = new RigidBody(RigidBodyType.Dynamic)
        .attach({
          data: [0.25, 0.25],
          density: 1,
          type: BodyPartType.Rect,
        });

      body.mask = CollisionGroups.Terrain;

      body.damping  = 3;
      body.velocity = [50, 0];
      body.isBullet = true;

      // Spawn bullet
      state.data.world
        .builder()
        .use(transform)
        .use(body)
        .build();
    }

    this.cooldown -= state.data.ticker.delta;
  }

}
