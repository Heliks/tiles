import {
  Circle,
  contains,
  Entity,
  Injectable,
  Parent,
  ProcessingSystem,
  StateMachine,
  Subscriber,
  Ticker,
  Transform,
  Vec2,
  vec2copy,
  World
} from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';
import {
  Camera,
  RenderNode,
  ScreenDimensions,
  SPRITE_SHEET_STORAGE,
  SpriteAnimation,
  SpriteDisplay,
  SpriteSheet,
  SpriteSheetFromTexture
} from '@heliks/tiles-pixi';
import { InputHandler, KeyCode } from '../input';
import { Idle } from './states';
import { AssetLoader, Handle } from '@heliks/tiles-assets';
import { CardinalDirection, Direction } from '../components';
import { GroupEvent } from '@heliks/ecs';
import { CollisionGroups, MATERIAL_ORGANIC, MaterialType } from '../const';
import { PawnBlackboard } from './pawn-blackboard';
import { Combat } from '../combat';

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
  target: Vec2
): void {
  // The magic number "0.6" simply fits well with the feet position of the player.
  transform.local.x = Math.sin(transform.rotation) / 2;
  transform.local.y = -Math.cos(transform.rotation) / 2;

  transform.lookAt(target);
}

/** Spawns a pawn into the `world`. */
export function spawnPawn(
  world: World,
  spritesheet: Handle<SpriteSheet>,
  x: number,
  y: number,
  node?: Entity
): void {
  const body = RigidBody.dynamic().attach(new Circle(0.2, 0, 0.1), {
    material: MaterialType.ORGANIC
  });

  body.damping = 10;
  body.group = CollisionGroups.Player;

  world
    .builder()
    .use(body)
    .use(new Combat())
    .use(new Direction())
    .use(new Pawn())
    .use(new Transform(x, y))
    .use(new SpriteDisplay(spritesheet, 1, node))
    .use(new SpriteAnimation([]))
    .build();
}

@Injectable()
export class PawnController extends ProcessingSystem {

  private readonly states = new Map<Entity, StateMachine<PawnBlackboard>>();

  /** @internal */
  private group$!: Subscriber;

  constructor(
    private readonly dimensions: ScreenDimensions,
    private readonly ticker: Ticker
  ) {
    super(contains(
      Direction,
      Pawn,
      RigidBody,
      SpriteAnimation,
      Transform
    ));
  }

  /** @inheritDoc */
  public boot(world: World): void {
    super.boot(world);

    // Subscribe to added / removed pawns.
    this.group$ = this.group.subscribe();
  }

  private spawn(world: World, entity: Entity): void {
    const transform = world.storage(Transform).get(entity);

    const directionIndicator = world
      .builder()
      .use(new SpriteDisplay(getDirectionIndicatorHandle(world), 0))
      .use(new Parent(entity))
      .use(transform.clone())
      .build();

    const state = new StateMachine<PawnBlackboard>({
      animation: world.storage(SpriteAnimation).get(entity),
      direction: world.storage(Direction).get(entity),
      body: world.storage(RigidBody).get(entity),
      directionIndicator,
      entity,
      input: world.get(InputHandler),
      ticker: this.ticker,
      transform,
      pawn: world.storage(Pawn).get(entity),
      world
    });

    state.start(new Idle());

    this.states.set(entity, state);
  }

  /** @inheritDoc */
  public update(world: World): void {
    // Todo: De-spawn removed pawns.
    for (const event of this.group.events(this.group$)) {
      if (event.type === GroupEvent.Added) {
        this.spawn(world, event.entity);
      }
    }

    for (const entity of this.group.entities) {
      const pawn = world.storage(Pawn).get(entity);

      // Reduce casting cool-down.
      if (pawn.cooldown > 0) {
        pawn.cooldown -= this.ticker.delta;
      }

      const state = this.states.get(entity)!;
      const { input } = state.data;

      // The exact x/y position in the world that the pawn is observing.
      const obsPoint = world.get(ScreenDimensions).toWorld(
        vec2copy(input.getMousePos())
      );

      const direction = world.storage(Direction).get(entity);
      const transform = world.storage(Transform).get(entity);

      transform.lookAt(obsPoint);

      updateDirectionIndicator(
        transform,
        world.storage(Transform).get(state.data.directionIndicator),
        obsPoint
      );

      state.data.pawn.direction = direction.toCardinal();
      state.update();

      // Todo: Do this correctly
      world.get(Camera).transform(
        -transform.world.x,
        -transform.world.y
      );
    }
  }

}
