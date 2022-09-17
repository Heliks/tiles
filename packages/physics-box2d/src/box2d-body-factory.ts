/* eslint-disable new-cap */
import { b2Body, b2BodyDef, b2FixtureDef, b2World } from '@flyover/box2d';
import { Entity, Transform } from '@heliks/tiles-engine';
import { Inject, Injectable } from '@heliks/tiles-injector';
import { Collider, MaterialManager, RigidBody } from '@heliks/tiles-physics';
import { B2_WORLD } from './const';
import { b2ParseBodyType, b2ParseShape } from './utils';


@Injectable()
export class Box2dBodyFactory {

  constructor(
    @Inject(B2_WORLD)
    private readonly world: b2World,
    private readonly materials: MaterialManager
  ) {}

  /**
   * Returns a `b2FixtureDef`, using the given `collider` as blueprint. If a `def` is
   * passed, that instance will be populated with the result.
   */
  public getFixtureDef(collider: Collider, def = new b2FixtureDef()): b2FixtureDef {
    // Attach the shape to the fixture.
    def.shape = b2ParseShape(collider.shape);
    def.isSensor = collider.sensor;

    // Assign material. Hard check here because the number 0 is a valid material id.
    if (collider.material !== undefined) {
      const material = this.materials.get(collider.material);

      def.density = material.density;
      def.friction = material.friction;
      def.restitution = material.restitution;
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
  public createBody(entity: Entity, body: RigidBody, transform = new Transform()): b2Body {
    const def = new b2BodyDef();

    def.fixedRotation = !body.rotate;
    def.type = b2ParseBodyType(body.type);

    // Set position and velocity.
    def.position.Set(transform.world.x, transform.world.y);
    def.linearVelocity.Copy(body.getVelocity());

    const bBody = this.world.CreateBody(def);
    const bFixtureDef = new b2FixtureDef();

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
