import { PhysicsWorld } from "./world";
import { Entity, Query } from "@tiles/entity-system";
import { ProcessingSystem, Subscriber, Ticker, Transform, Vec2, World } from "@tiles/engine";
import { BodyPart, RigidBody, RigidBodyType } from "./rigid-body";
import { Injectable } from "@tiles/injector";
import { b2Body, b2BodyDef, b2BodyType, b2FixtureDef, b2PolygonShape, b2Vec2, b2World } from "@flyover/box2d";
import { ComponentEventType } from "@tiles/entity-system";
import { bCreateBody, bCreateBodyPart } from "./utils";

@Injectable()
export class PhysicsSystem extends ProcessingSystem {

  /** Contains Box2D bodies mapped to the entity to which they belong.*/
  protected bodies = new Map<Entity, b2Body>();

  /** Event subscriber for `Storage<RigidBody>`. */
  protected body$!: Subscriber;

  /** Box2D world. */
  protected get bWorld() {
    return this.world.bWorld;
  }

  constructor(protected readonly world: PhysicsWorld) {
    super();
  }

  /** {@inheritDoc} */
  public boot(world: World): void {
    // Setup the physics world with event handlers etc.
    this.world.setup(world);

    // Subscribe to changes in the rigid body storage.
    this.body$ = world.storage(RigidBody).events().subscribe();

    // Boot processing system.
    super.boot(world);
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        RigidBody,
        Transform
      ]
    };
  }

  /**
   * Creates an actual physical body for `entity`, based on the given rigid `body`
   * and adds it to the world at `position`.
   */
  protected createBody(entity: Entity, body: RigidBody, position: Vec2): void {
    const bBody = bCreateBody(this.bWorld, body, position);
    const bFixtureDef = new b2FixtureDef();

    // Attach body parts.
    for (const part of body.bodyParts) {
      bCreateBodyPart(part, body, bFixtureDef, bBody);
    }

    // Assign the entity to which the body belongs as user data to the Box2D body
    // so that we can backtrack it later on.
    bBody.SetUserData(entity);
    bBody.SetLinearDamping(body.damping);

    // Enables continuous collision detection on the body which prevents small
    // fixtures (like bullets) from passing through thin fixtures.
    if (body.isBullet) {
      bBody.SetBullet(true);
    }

    // Save Box2D body for the entity.
    this.bodies.set(entity, bBody);
  }

  /** Destroys the rigid body of the given `entity`. */
  protected destroyBody(entity: Entity): void {
    const body = this.bodies.get(entity);

    if (body) {
      this.bWorld.DestroyBody(body);
    }
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const _bodies  = world.storage(RigidBody);
    const _trans = world.storage(Transform);

    // Check if any rigid bodies were added or removed.
    for (const event of _bodies.events().read(this.body$)) {
      switch (event.type) {
        case ComponentEventType.Added:
          const transform = _trans.get(event.entity);

          this.createBody(event.entity, _bodies.get(event.entity), [
            transform.x,
            transform.y
          ]);
          break;
        case ComponentEventType.Removed:
          this.destroyBody(event.entity);
          break;
      }
    }

    // Update entities with rigid bodies.
    for (const entity of this.group.entities) {
      const bBody = this.bodies.get(entity);

      if (bBody) {
        const body  = _bodies.get(entity);
        const trans = _trans.get(entity);

        // Transform velocity if necessary.
        if (body.transVelocity) {
          bBody.SetLinearVelocity(new b2Vec2(
            body.transVelocity[0],
            body.transVelocity[1]
          ));

          body.transVelocity = undefined;
        }

        const velocity = bBody.GetLinearVelocity();
        const position = bBody.GetPosition();

        body.velocity[0] = velocity.x;
        body.velocity[1] = velocity.y;

        // Update values on transform component.
        trans.setPosition(position.x, position.y);
      }
    }

    // Move the physics world forward in time.
    this.world.update();
  }

}
