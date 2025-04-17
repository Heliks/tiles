/* eslint-disable new-cap */
import { B2Body, B2BodyDef, B2Filter, B2Fixture, B2FixtureDef, B2World } from '@heliks/box2d';
import { Entity, Inject, Injectable, Transform } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';
import { B2_WORLD } from './const';
import { B2ParseBodyType, B2ParseShape } from './utils';


@Injectable()
export class Box2dBodyFactory {

  constructor(
    @Inject(B2_WORLD)
    private readonly world: B2World
  ) {}

  /** Creates a Box2D collision filter from the settings of the given `collider`. */
  public createFilter(collider: Collider): B2Filter {
    const filter = new B2Filter();

    Object.assign(filter, {
      categoryBits: collider.group,
      maskBits: collider.mask
    });

    return filter;
  }

  /** Updates the given `fixture` according to the settings of the given `collider`. */
  public setFixtureData(collider: Collider, fixture: B2Fixture): void {
    fixture.SetFilterData(this.createFilter(collider));
  }

  /** Returns the Box2D fixture of the given `collider` that is attached to `body`.  */
  public getFixture(body: B2Body, collider: Collider): B2Fixture | undefined {
    for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
      if (fixture.GetUserData().collider === collider) {
        return fixture;
      }
    }
  }

  /**
   * Returns a `B2FixtureDef`, using the given `collider` as blueprint. If a `def` is
   * passed, that instance will be populated with the result.
   */
  public getFixtureDef(collider: Collider, def = new B2FixtureDef()): B2FixtureDef {
    // Attach the shape to the fixture.
    def.shape = B2ParseShape(collider.shape);
    def.isSensor = collider.sensor;

    // Assign material. Hard check here because the number 0 is a valid material id.
    if (collider.material !== undefined) {
      def.density = collider.material.density;
      def.friction = collider.material.friction;
      def.restitution = collider.material.restitution;
    }

    // Collision groups are inherited by the rigid body itself.
    if (collider.group !== undefined) {
      def.filter.categoryBits = collider.group;
    }

    if (collider.mask !== undefined) {
      def.filter.maskBits = collider.mask;
    }

    return def;
  }

  /** @inheritDoc */
  public createBody(entity: Entity, body: RigidBody, transform = new Transform()): B2Body {
    const def = new B2BodyDef();

    def.fixedRotation = !body.rotate;
    def.type = B2ParseBodyType(body.type);

    // Set position and velocity.
    def.position.Set(transform.world.x, transform.world.y);
    def.linearVelocity.Copy(body.getVelocity());

    const bBody = this.world.CreateBody(def);
    const bFixtureDef = new B2FixtureDef();

    // Add colliders as fixtures.
    for (const collider of body.colliders) {
      this.getFixtureDef(collider, bFixtureDef);

      // Assign "Collider" to created fixture for later backtracking.
      bBody
        .CreateFixture(bFixtureDef)
        .SetUserData({
          body,
          collider,
          entity
        });
    }

    bBody.SetLinearDamping(body.damping);
    bBody.SetAngle(transform.rotation);

    // Assign entity to the Box2D body for later back-tracking.
    bBody.SetUserData(entity);

    // Enables continuous collision detection on the body which prevents small fixtures
    // (like bullets) from passing through thin fixtures.
    bBody.SetBullet(body.isBullet);

    return bBody;
  }

}
