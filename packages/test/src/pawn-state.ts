import { FlipDirection, ShapeDisplay, ShapeKind, SpriteAnimation } from "@tiles/pixi";
import { BodyPartType, RigidBody, RigidBodyType } from "@tiles/physics";
import { InputHandler, KeyCode } from "./input";
import { deg2rad, State, StateMachine, Ticker, Transform, Vec2, World } from "@tiles/engine";
import { CollisionGroups, Direction } from "./const";
import { Pawn } from "./player-controller";

export interface PawnStateData {
  animation: SpriteAnimation;
  body: RigidBody;
  input: InputHandler;
  pawn: Pawn;
  ticker: Ticker;
  world: World;
  transform: Transform;
}

export function shoot(state: StateMachine<PawnStateData>) {
  const pawn = state.data.pawn;

  if (state.data.input.isKeyDown(KeyCode.Q) && pawn.canCast()) {
    // Shoot arrow in pawn direction.
    state.push(new ShootArrow(pawn.direction));

    // Prevent from casting again right away.
    pawn.cooldown = 500;

    return true;
  }

  return false;
}

export class WalkState implements State<StateMachine<PawnStateData>> {

  /** Movement speed. */
  protected speed = 2;

  /** {@inheritDoc} */
  update(state: StateMachine<PawnStateData>): void {
    const { animation, input, pawn, ticker } = state.data;

    // Check if movement was canceled in favor of engaing in combat.
    if (shoot(state)) {
      return;
    }

    // Velocity on x and y axis.
    let vx = 0;
    let vy = 0;

    // Characters movement velocity adjusted to frame rate.
    const velocity = this.speed * 32 / ticker.delta;

    // Move left
    if (input.isKeyDown(KeyCode.A)) {
      animation.play('walk-right').flipTo(FlipDirection.Horizontal);

      pawn.direction = Direction.Left;

      vx -= velocity;
    }
    // Move right
    else if (input.isKeyDown(KeyCode.D)) {
      animation.play('walk-right').flipTo(FlipDirection.None);

      pawn.direction = Direction.Right;

      vx += velocity;
    }

    // Move up
    if (input.isKeyDown(KeyCode.W)) {
      animation.play('walk-up');

      pawn.direction = Direction.Up;

      vy -= velocity;
    }
    // Move down
    else if (input.isKeyDown(KeyCode.S)) {
      animation.play('walk-down');

      pawn.direction = Direction.Down;

      vy += velocity;
    }

    // If the character is moving we transform its velocity, otherwise
    // we exit the state as we are no longer moving.
    if (vx !== 0 || vy !== 0) {
      state.data.body.transformVelocity(
        vx,
        vy
      );
    }
    else {
      state.pop();
    }
  }

}

export class ShootArrow implements State<StateMachine<PawnStateData>> {

  protected duration = 600;
  protected casting = true;

  constructor(protected readonly direction: Direction) {}

  protected getVelocity(): Vec2 {
    switch (this.direction) {
      case Direction.Left:
        return [-50, 0];
      case Direction.Right:
        return [50, 0];
      case Direction.Up:
        return [0, -50];
      case Direction.Down:
        return [0, 50];
    }
  }

  /** {@inheritDoc} */
  onStart(state: StateMachine<PawnStateData>): void {
    if (this.direction === Direction.Left) {
      state.data.animation.reset().play('bow-right', false).flipTo(FlipDirection.Horizontal);
    }
    else {
      state.data.animation.reset().play('bow-right', false);
    }
  }

  onResume(state: StateMachine<PawnStateData>): void {
    state.pop();
  }

  /** {@inheritDoc} */
  update(state: StateMachine<PawnStateData>): void {
    this.duration -= state.data.ticker.delta;

    if (this.duration <= 300 && this.casting) {
      let { x, y } = state.data.transform;

      // Degrees by which we want to rotate the bullet.
      let rotation = 0;

      // Todo: Bottom and up.
      switch (this.direction) {
        case Direction.Left:
          x -= 0.5;
          y -= 0.2;
          break;
        case Direction.Right:
          x += 0.5;
          y -= 0.2;
          break;
        case Direction.Up:
        case Direction.Down:
          rotation = deg2rad(90);
          break;
      }

      const body = new RigidBody(RigidBodyType.Dynamic)
        .tag('arrow')
        .tag('bullet')
        .attach({
          data: [0.5, 0.1],
          density: 1,
          type: BodyPartType.Rect
        });

      // The body is rotated by 90 degrees if it is shot up or down.
      body.rotation = rotation;

      body.mask = CollisionGroups.Terrain;

      body.damping  = 3;
      body.velocity = this.getVelocity();
      body.isBullet = true;

      // Spawn bullet
      const arrow = state.data.world
        .builder()
        .use(new Transform(x, y))
        .use(new ShapeDisplay(ShapeKind.Rect, [0.5, 0.1]).fill(0xFF00FF))
        .use(body)
        .build();

      // Arrow was show, prevent it from shooting again.
      this.casting = false;
    }

    if (this.duration <= 0) {
      // Exit the current state.
      state.pop();

      // Check if another task was queued.
      shoot(state);
    }
  }

}

export class IdleState implements State<StateMachine<PawnStateData>> {

  /** Plays the Idle animation for the appropriate `direction`. */
  public play(animation: SpriteAnimation, direction: Direction): void {
    switch (direction) {
      case Direction.Left:
        animation.play('idle-right').flipTo();
        break;
      case Direction.Right:
        animation.play('idle-right');
        break;
      case Direction.Up:
        animation.play('idle-up');
        break;
      case Direction.Down:
        animation.play('idle-down');
        break;
    }
  }

  /** {@inheritDoc} */
  public onStart(state: StateMachine<PawnStateData>): void {
    this.play(state.data.animation, state.data.pawn.direction);
  }

  /** {@inheritDoc} */
  public onResume(state: StateMachine<PawnStateData>): void {
    this.play(state.data.animation, state.data.pawn.direction);
  }

  /** {@inheritDoc} */
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

    if (shoot(state)) {
      return;
    }
  }

}
