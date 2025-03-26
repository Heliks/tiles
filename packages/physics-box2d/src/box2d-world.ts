/* eslint-disable new-cap */
import { B2Body, B2World } from '@heliks/box2d';
import { Entity, Inject, Injectable, Transform, Vec2, World, XY } from '@heliks/tiles-engine';
import { ContactEvents, Physics, Ray, RigidBody } from '@heliks/tiles-physics';
import { syncBodyPosition, syncBodyRotation, syncBodyVelocity } from './body';
import { Box2dBodyFactory } from './box2d-body-factory';
import { Box2dContactListener } from './box2d-contact-listener';
import { Box2dRaycaster } from './box2d-raycaster';
import { B2_WORLD } from './const';
import { syncBodyFixtures } from './fixtures';


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
  private readonly bodies = new Map<Entity, B2Body>();

  /**
   * @param world Box2D world.
   * @param raycasts Event queue for raycasts.
   * @param factory {@link Box2dBodyFactory}
   */
  constructor(
    @Inject(B2_WORLD)
    private readonly world: B2World,
    private readonly raycasts: Box2dRaycaster,
    private readonly factory: Box2dBodyFactory
  ) {
    super();
  }

  /** @inheritDoc */
  public setup(world: World): void {
    // Sets up a custom Box2D contact-listener which will forward events to the
    // event-queue.
    this.world.SetContactListener(new Box2dContactListener(world.get(ContactEvents)));
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

    body.SetEnabled(component.enabled);

    syncBodyPosition(body, component, transform);
    syncBodyRotation(body, component, transform);

    // Apply force.
    if (component._force.read()) {
      body.ApplyForceToCenter(component._force.value, true);
    }

    syncBodyVelocity(body, component);
    syncBodyFixtures(body);
  }

  /** @inheritDoc */
  public drawDebugData(): void {
    this.world.DebugDraw();
  }

  /** @inheritDoc */
  public impulse(entity: Entity, force: Vec2): void {
    const body = this.bodies.get(entity);

    if (body) {
      body.ApplyLinearImpulse(force, body.GetWorldCenter());
    }
  }

  /** @inheritDoc */
  public raycast(ray: Ray, from: XY, to: XY): void {
    this.raycasts.cast(ray, from, to);
  }

}
