import {
  atan2,
  Entity,
  EntityQuery,
  Injectable,
  ProcessingSystem,
  StateMachine,
  Ticker,
  Transform,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import {
  Camera,
  ScreenDimensions,
  SPRITE_SHEET_STORAGE,
  SpriteAnimation,
  SpriteDisplay,
  SpriteSheet,
  SpriteSheetFromTexture
} from '@heliks/tiles-pixi';
import { InputHandler } from '../input';
import { PawnStateData } from './utils';
import { Idle } from './states/idle';
import { AssetLoader, Handle } from '@heliks/tiles-assets';
import { CardinalDirection, Direction } from '../components/direction';

export class Pawn {

  /** @deprecated */
  public direction = CardinalDirection.South;

  public cooldown = 0;
  public speed = 1;

  public canCast() {
    return this.cooldown <= 0;
  }

}

/** @internal */
function getDirectionIndicatorHandle(world: World): Handle<SpriteSheet> {
  return world.get(AssetLoader).load(
    'ux/direction-indicator.png',
    new SpriteSheetFromTexture(1, 1, 16, 16),
    world.get(SPRITE_SHEET_STORAGE)
  );
}

/**
 * Updates the direction indicator that is displayed for some entities.

 */
function updateDirectionIndicator(
  origin: Transform,
  transform: Transform,
  direction: number,
  target: Vec2
): void {
  // The magic number simply fits well with the feet of the character sprite. Adjust
  // accordingly.
  transform.x = (Math.sin(direction) / 2) + origin.x;
  transform.y = (-Math.cos(direction) / 2) + origin.y + 0.6;

  transform.rotation = atan2(
    target[1] - transform.y,
    target[0] - transform.x
  );
}

@Injectable()
export class PawnController extends ProcessingSystem {

  private readonly input  = new InputHandler();
  private readonly states = new Map<Entity, StateMachine<PawnStateData>>();

  constructor(protected readonly ticker: Ticker) {
    super();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [
        Direction,
        Pawn,
        RigidBody,
        SpriteAnimation,
        Transform
      ]
    };
  }

  // Todo: Do this correcly
  private getPawnState(world: World, entity: Entity): StateMachine<PawnStateData> {
    let state = this.states.get(entity);

    if (state) {
      return state;
    }

    const transform = world.storage(Transform).get(entity);

    const directionIndicator = world
      .builder()
      .use(new SpriteDisplay(getDirectionIndicatorHandle(world), 0))
      .use(transform.clone())
      .build()

    state = new StateMachine<PawnStateData>({
      animation: world.storage(SpriteAnimation).get(entity),
      direction: world.storage(Direction).get(entity),
      body: world.storage(RigidBody).get(entity),
      directionIndicator,
      input: this.input,
      ticker: this.ticker,
      transform,
      pawn: world.storage(Pawn).get(entity),
      world
    });

    state.start(new Idle());

    this.states.set(entity, state);

    return state;
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.group.entities) {
      const pawn = world.storage(Pawn).get(entity);

      // Reduce casting cool-down.
      if (pawn.cooldown > 0) {
        pawn.cooldown -= this.ticker.delta;
      }

      const state = this.getPawnState(world, entity);
      const { input, transform } = state.data;

      // The exact x/y position in the world that the pawn is observing.
      const obsPoint = world.get(ScreenDimensions).toWorld([
        ...input.getMousePos()
      ]);

      const direction = world.storage(Direction).get(entity);

      // Set the direction in which we are facing or aiming projectiles etc.
      direction.lookAt(transform.toVec2(), obsPoint);

      updateDirectionIndicator(
        transform,
        world.storage(Transform).get(state.data.directionIndicator),
        direction.rad,
        obsPoint
      );

      state.data.pawn.direction = direction.toCardinal();

      state.update();

      // Todo: Do this correctly
      world.get(Camera).transform(
        -transform.x,
        -transform.y
      );
    }
  }

}
