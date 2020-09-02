import { b2Body, b2FixtureDef, b2Vec2, b2World } from '@flyover/box2d';
import { Entity, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Renderer } from '@heliks/tiles-pixi';
import { ContactEvents } from '../events';
import { PhysicsAdapter } from '../physics-adapter';
import { RigidBody } from '../rigid-body';
import { Box2dContactListener } from './box2d-contact-listener';
import { Box2dDebugDraw } from './box2d-debug-draw';
import { parseBody, parseCollider } from './utils';

// Needs to be disabled for Box2D.
/* eslint-disable new-cap */
export class Box2dWorld implements PhysicsAdapter {

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

  /** Contains the Box2D world. */
  private readonly world: b2World;

  constructor(gravity: Vec2) {
    // noinspection JSPotentiallyInvalidConstructorUsage
    this.world = new b2World(new b2Vec2(
      gravity[0],
      gravity[1]
    ));
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
  public createBody(entity: Entity, body: RigidBody, position: Vec2): void {
    const bBody = this.world.CreateBody(parseBody(body, position));
    const bFixtureDef = new b2FixtureDef();

    // Add colliders as fixtures.
    for (const collider of body.colliders) {
      parseCollider(body, bFixtureDef, collider);

      bBody.CreateFixture(bFixtureDef);
    }

    // Assign the entity to which the body belongs as user data to the Box2D body so that
    // we can backtrack it later on.
    bBody.SetUserData(entity);
    bBody.SetLinearDamping(body.damping);

    bBody.SetAngle(body.rotation);

    // Enables continuous collision detection on the body which prevents small fixtures
    // (like bullets) from passing through thin fixtures.
    if (body.isBullet) {
      bBody.SetBullet(true);
    }

    // Save Box2D body for the entity.
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
  public updateEntityBody(entity: Entity, body: RigidBody, trans: Transform): void {
    const bBody = this.bodies.get(entity);

    if (!bBody) {
      return;
    }

    const position = bBody.GetPosition();
    const velocity = bBody.GetLinearVelocity();

    trans.x = position.x;
    trans.y = position.y;
    trans.rotation = bBody.GetAngle();

    // Update velocity on the rigid body if it was transformed.
    if (body.isVelocityDirty) {
      bBody.SetLinearVelocity(velocity.Set(
        body.velocity[0],
        body.velocity[1]
      ));

      body.isVelocityDirty = false;
    }

    body.velocity[0] = velocity.x;
    body.velocity[1] = velocity.y;
  }

  /** @inheritDoc */
  public setupDebugDraw(renderer: Renderer): void {
    // Register the box2d adapter for debug draw callbacks.
    this.world.SetDebugDraw(new Box2dDebugDraw(renderer));
  }

  /** @inheritDoc */
  public drawDebugData(): void {
    this.world.DrawDebugData();
  }

}
