import {
  deg2rad,
  Entity,
  EntityQuery,
  Injectable,
  ProcessingSystem,
  Subscriber,
  Ticker,
  Transform,
  Vec2,
  World
} from '@heliks/tiles-engine';
import { BodyPartType, ContactEvents, RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { Health } from '../components/health';
import { CollisionGroups } from '../const';
import { ShapeDisplay, ShapeKind } from '@heliks/tiles-pixi';
import { CardinalDirection } from '../components/direction';

/** Component for an arrow projectile. */
export class Arrow {

  /** Time in MS that the projectile has been alive in the world. */
  public lifetime = 0;

  /**
   * @param damage The base damage value of the arrow projectile.
   */
  constructor(public damage = 1) {}

}

/** @internal */
function getArrowRotation(direction: CardinalDirection): number {
  return direction === CardinalDirection.North || direction === CardinalDirection.South ? deg2rad(90) : 0;
}

/** @internal */
function getArrowVelocity(direction: CardinalDirection): Vec2 {
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

/** Shoots an `arrow` in `direction` from the `x` and `y` position. */
export function shootArrow(world: World, x: number, y: number, direction: CardinalDirection, arrow: Arrow): Entity {
  const body = new RigidBody(RigidBodyType.Dynamic).attach({
    data: [0.5, 0.1],
    type: BodyPartType.Rect
  });

  // Only allow the body to collide with the terrain
  // Todo: Should collide with enemies too.
  body.mask = CollisionGroups.Terrain;

  body.damping = 0.5;
  body.isBullet = true;

  // Apply rotation and velocity according to the direction in which the arrow is shot.
  body.rotation = getArrowRotation(direction);
  body.velocity = getArrowVelocity(direction);

  return world
    .builder()
    .use(new Transform(x, y))
    .use(new ShapeDisplay(ShapeKind.Rect, [0.5, 0.1]).fill(0xFF00FF))
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
    private readonly events: ContactEvents,
    private readonly ticker: Ticker
  ) {
    super();
    this.event$ = events.subscribe();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [ Arrow ]
    };
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

          // Apply damage according to the projectiles damage value.
          health.current -= arrows.get(entityA).damage;

          // Todo: For debugging purposes. Should be removed after I have a GUI for
          //  entity health.
          console.log(`${entityB} hit (hp ${health.current} / ${health.total})`);
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
