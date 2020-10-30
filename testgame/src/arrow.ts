import {
  contains,
  Entity,
  Inject,
  Injectable,
  ProcessingSystem,
  Subscriber,
  Ticker,
  Transform,
  Vec2,
  vec2,
  World
} from '@heliks/tiles-engine';
import { ContactEvents, RigidBody } from '@heliks/tiles-physics';
import { ShapeDisplay, ShapeKind, SPRITE_SHEET_STORAGE } from '@heliks/tiles-pixi';
import { Health } from './components';
import { CollisionGroups } from './const';
import { rand, Rectangle } from '@heliks/tiles-math';
import { AssetLoader } from '@heliks/tiles-assets';

/** Component for an arrow projectile. */
export class Arrow {

  /** Time in MS that the projectile has been alive. */
  public lifetime = 0;

  /**
   * @param source The entity that shot this arrow.
   * @param damage Min and max damage value of the arrow projectile.
   */
  constructor(public source: Entity, public damage: Vec2) {}

  /**
   * Returns a random damage value between the minimum and maximum damage of this
   * projectile.
   */
  public getDamage(): number {
    return Math.round(rand(
      this.damage.x,
      this.damage.y
    ));
  }

}

/** Shoots an `arrow` in `direction` from the `x` and `y` position. */
export function shootArrow(world: World, transform: Transform, arrow: Arrow): Entity {
  const body = RigidBody.dynamic().attach(new Rectangle(0.1, 0.5));

  // Only allow the body to collide with the terrain
  // Todo: Should collide with enemies too.
  body.mask = CollisionGroups.Terrain | CollisionGroups.Enemy;

  body.damping = 0.5;
  body.isBullet = true;

  body.velocity.x = Math.sin(transform.rotation) * 25;
  body.velocity.y = -Math.cos(transform.rotation) * 25;

  return world
    .builder()
    .use(transform.clone())
    .use(new ShapeDisplay(ShapeKind.Rect, vec2(0.1, 0.5)).fill(0xFF00FF))
    .use(arrow)
    .use(body)
    .build();
}

/** Handles arrow combat. */
@Injectable()
export class ArrowSystem extends ProcessingSystem {

  /**
   * The amount of MS that a projectile can be alive in the world before it automatically
   * gets cleaned up by the system.
   */
  public maxLifetime = 5000;

  /** @internal */
  private readonly event$: Subscriber;

  constructor(
    private readonly assets: AssetLoader,
    private readonly events: ContactEvents,
    private readonly ticker: Ticker,
    @Inject(SPRITE_SHEET_STORAGE)
    private readonly s: any
  ) {
    super(contains(Arrow));

    this.event$ = events.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const arrows = world.storage(Arrow);
    const healths = world.storage(Health);

    for (const { entityA, entityB } of this.events.read(this.event$)) {
      if (arrows.has(entityA)) {
        // Always de-spawn on impact.
        world.destroy(entityA);

        if (healths.has(entityB)) {
          const health = healths.get(entityB);
          const arrow = arrows.get(entityA);

          health.damage(arrow.source, arrow.getDamage());
        }
      }
    }

    for (const entity of this.group.entities) {
      const arrow = arrows.get(entity);

      arrow.lifetime += this.ticker.delta;

      // Remove projectiles that are past their maximum lifetime to prevent them from
      // piling up somewhere outside the screen and therefore negatively impacting FPS.
      if (arrow.lifetime >= this.maxLifetime) {
        world.destroy(entity);
      }
    }
  }

}
