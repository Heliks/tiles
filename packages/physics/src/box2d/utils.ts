import { b2BodyDef, b2BodyType, b2CircleShape, b2FixtureDef, b2PolygonShape, b2Shape } from '@flyover/box2d';
import { Vec2 } from '@heliks/tiles-engine';
import { Collider, Shape } from '../collider';
import { RigidBody, RigidBodyType } from '../rigid-body';
import { Circle } from '@heliks/tiles-math';

// Needs to be disabled for Box2D.
/* eslint-disable new-cap */

/** @internal */
function parseShape(shape: Shape): b2Shape {
  // Circles.
  if (shape instanceof Circle) {
    return new b2CircleShape().Set(shape, shape.radius);
  }

  const box = new b2PolygonShape();

  // Convert the polygon to a box.
  box.SetAsBox(
    shape.width / 2,
    shape.height / 2,
    shape
  );

  return box;
}

/** @internal */
export function parseCollider(body: RigidBody, def: b2FixtureDef, collider: Collider): void {
  // Attach the shape to the fixture.
  def.shape = parseShape(collider.shape);

  if (collider.sensor) {
    def.isSensor = true;
  }
  else {
    def.density = collider.density;
    def.friction = collider.friction;
    def.restitution = body.restitution;
  }

  // Collision groups are inherited by the rigid body itself.
  def.filter.categoryBits = body.group;
  def.filter.maskBits = body.mask;
}

/**
 * Helper that creates a Box2D body based on `body`. The body will then be
 * added to the world at the given `position`.
 */
export function parseBody(body: RigidBody, position: Vec2): b2BodyDef {
  const def = new b2BodyDef();

  // If true the body won't be allowed to rotate.
  def.fixedRotation = !body.rotate;
  def.position.Set(position.x, position.y);

  // Initially inherit the velocity value set on the body.1q
  def.linearVelocity.Set(body.velocity.x, body.velocity.y);

  // assign body type
  switch (body.type) {
    case RigidBodyType.Dynamic:
      def.type = b2BodyType.b2_dynamicBody;
      break;
    case RigidBodyType.Kinematic:
      def.type = b2BodyType.b2_kinematicBody;
      break;
    default:
    case RigidBodyType.Static:
      def.type = b2BodyType.b2_staticBody;
      break;
  }

  return def;
}
