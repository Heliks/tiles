/* eslint-disable new-cap */
import { b2Body, b2BodyDef, b2FixtureDef, b2World } from '@flyover/box2d';
import { Entity, Transform, Vec2, World } from '@heliks/tiles-engine';
import { Renderer } from '@heliks/tiles-pixi';
import { ContactEvents } from '../events';
import { RigidBody } from '../rigid-body';
import { Box2dContactListener } from './box2d-contact-listener';
import { Box2dDebugDraw } from './box2d-debug-draw';
import { b2ParseBodyType, b2ParseShape } from './utils';
import { Physics } from '../physics';
import { Collider } from '../collider';

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

  /** Contains the Box2D world. */
  private readonly world: b2World;

  constructor(gravity: Vec2) {
    super();

    // noinspection JSPotentiallyInvalidConstructorUsage
    this.world = new b2World(gravity);
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

  /**
   * Parses a `collider` and assigns the parsed data to `def`. This is used internally
   * to convert from `Collider` -> `b2FixtureDef` -> `b2Fixture`.
   */
  private parseCollider(body: RigidBody, collider: Collider, def: b2FixtureDef): void {
    // Attach the shape to the fixture.
    def.shape = b2ParseShape(collider.shape);

    if (collider.sensor) {
      def.isSensor = true;
    }

    // Assign material. Hard check here because the number 0 is a valid material id.
    if (collider.material !== undefined) {
      const material = this.getMaterial(collider.material);

      def.density = material.density;
      def.friction = material.friction;
      def.restitution = material.restitution;
    }

    // Collision groups are inherited by the rigid body itself.
    def.filter.categoryBits = body.group;
    def.filter.maskBits = body.mask;
  }

  /** @inheritDoc */
  public createBody(entity: Entity, body: RigidBody, transform: Transform): void {
    const def = new b2BodyDef();

    def.fixedRotation = !body.rotate;
    def.type = b2ParseBodyType(body.type);

    // Set position and velocity.
    def.position.Set(transform.world.x, transform.world.y);
    def.linearVelocity.Set(body.velocity.x, body.velocity.y);

    const bBody = this.world.CreateBody(def);
    const bFixtureDef = new b2FixtureDef();

    // Add colliders as fixtures.
    for (const collider of body.colliders) {
      this.parseCollider(body, collider, bFixtureDef);

      // Assign "Collider" to created fixture for later backtracking.
      bBody.CreateFixture(bFixtureDef).SetUserData(collider);
    }

    bBody.SetLinearDamping(body.damping);
    bBody.SetAngle(transform.rotation);

    // Assign entity to the Box2D body for later back-tracking.
    bBody.SetUserData(entity);

    // Enables continuous collision detection on the body which prevents small fixtures
    // (like bullets) from passing through thin fixtures.
    bBody.SetBullet(body.isBullet);

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
  public updateEntityBody(entity: Entity, body: RigidBody, trans: Transform): void {
    const bBody = this.bodies.get(entity);

    if (!bBody) {
      return;
    }

    const position = bBody.GetPosition();
    const velocity = bBody.GetLinearVelocity();

    trans.world.x = position.x;
    trans.world.y = position.y;
    trans.rotation = bBody.GetAngle();

    // Update velocity on the rigid body if it was transformed.
    if (body.isVelocityDirty) {
      bBody.SetLinearVelocity(velocity.Set(
        body.velocity.x,
        body.velocity.y
      ));

      body.isVelocityDirty = false;
    }

    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
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

  /** @inheritDoc */
  public impulse(entity: Entity, force: Vec2): void {
    const body = this.bodies.get(entity);

    if (body) {
      body.ApplyLinearImpulse(force, body.GetWorldCenter());
    }
  }

}
