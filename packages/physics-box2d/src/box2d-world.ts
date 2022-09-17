/* eslint-disable new-cap */
import { b2Body, b2World } from '@flyover/box2d';
import { Entity, Inject, Injectable, Transform, Vec2, World, XY } from '@heliks/tiles-engine';
import { Collider, ContactEvents, Physics, RaycastObstacle, RigidBody } from '@heliks/tiles-physics';
import { Box2dBodyFactory } from './box2d-body-factory';
import { Box2dContactListener } from './box2d-contact-listener';
import { B2_RAYCASTS, B2_WORLD, RaycastQueue } from './const';
import { syncBodyFixtures } from './fixtures';
import { syncBodyPosition, syncBodyRotation, syncBodyVelocity } from './body';


/** User data that will be assigned to `b2Fixture` instances. */
interface FixtureUserData {
  /** Collider instance from which this fixture was created. */
  collider: Collider;
  /** Owner of the rigid body to which the `collider` is attached to. */
  entity: Entity;
}


@Injectable()
export class Box2dWorld extends Physics {

  /**
   * How many iterations are allowed for the physics velocity calculation phase. Less
   * increases performance but makes physics calculations less accurate.
   */
  public velocityIterations = 2;

  /**
   * How many iterations are allowed for the box2d position calculation phase. Less
   * increases performance but makes physics calculations less accurate.
   */
  public positionIterations = 6;

  /** Contains Box2D bodies mapped to the entity to which they belong.*/
  private readonly bodies = new Map<Entity, b2Body>();

  /**
   * @param world Box2D world.
   * @param raycasts Event queue for raycasts.
   * @param factory {@link Box2dBodyFactory}
   */
  constructor(
    @Inject(B2_WORLD)
    private readonly world: b2World,
    @Inject(B2_RAYCASTS)
    private readonly raycasts: RaycastQueue,
    private readonly factory: Box2dBodyFactory
  ) {
    super();
  }

  /** @inheritDoc */
  public setup(world: World): void {
    // Sets up a custom Box2D contact-listener which will forward events to the
    // event-queue.
    this.world.SetContactListener(new Box2dContactListener(
      world.get(ContactEvents),
      world
    ));
  }

  /** @inheritDoc */
  public update(delta: number): void {
    this.world.Step(delta, this.velocityIterations, this.positionIterations);
  }

  /** @inheritDoc */
  public createBody(entity: Entity, body: RigidBody, transform: Transform): void {
    const bBody = this.factory.createBody(entity, body, transform);

    // Assign body to entity.
    this.bodies.set(entity, bBody);
  }

  /** @inheritDoc */
  public destroyBody(entity: Entity): void {
    const body = this.bodies.get(entity);

    if (body) {
      this.world.DestroyBody(body);
    }
  }

  /** @inheritDoc */
  public updateEntityBody(entity: Entity, component: RigidBody, transform: Transform): void {
    const body = this.bodies.get(entity);

    if (! body) {
      return;
    }

    syncBodyPosition(body, component, transform);
    syncBodyRotation(body, component, transform);

    // Apply force.
    if (component._force.read()) {
      body.ApplyForce(component._force.value, body.GetWorldCenter());
    }

    syncBodyVelocity(body, component);
    syncBodyFixtures(body);
  }

  /** @inheritDoc */
  public drawDebugData(): void {
    this.world.DrawDebugData();
  }

  /** @inheritDoc */
  public impulse(entity: Entity, force: Vec2): void {
    const body = this.bodies.get(entity);

    if (body) {
      body.ApplyLinearImpulse(force, body.GetWorldCenter());
    }
  }

  /** @inheritDoc */
  public raycast(start: XY, end: XY, obstacles: RaycastObstacle[] = []): RaycastObstacle[] {
    this.world.RayCast(start, end, fixture => {
      obstacles.push(fixture.GetUserData() as FixtureUserData);

      return 0;
    });

    // Since this can run fairly often we only push these events in case there are any
    // subscribers to this queue to prevent the creation of unnecessary garbage that has
    // to be collected. This will mostly be used to draw debug information anyway.
    if (this.raycasts.subscriberAmount > 0) {
      this.raycasts.push({
        start,
        end
      });
    }

    return obstacles;
  }

}
