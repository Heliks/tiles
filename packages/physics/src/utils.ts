import { BodyPart, RigidBody, RigidBodyType } from "./rigid-body";
import { b2Body, b2BodyDef, b2BodyType, b2FixtureDef, b2PolygonShape, b2World } from "@flyover/box2d";
import { Vec2 } from "@tiles/engine";

/**
 * Helper that creates a Box2D fixture based on `part` and `body` and adds it to
 * the Box2D body `bBody`.
 */
export function bCreateBodyPart(
  part: BodyPart,
  body: RigidBody,
  bFixtureDef: b2FixtureDef,
  bBody: b2Body
): void {
  const data = {
    density: 1,
    friction: 0.5,
    position: [0, 0],
    ...part
  };

  bFixtureDef.density = data.density;
  bFixtureDef.friction = data.friction;
  bFixtureDef.restitution = body.restitution;

  // Collision groups are inherited by the rigid body itself.
  bFixtureDef.filter.categoryBits = body.group;
  bFixtureDef.filter.maskBits = body.mask;

  // Todo: Other shapes.
  bFixtureDef.shape = new b2PolygonShape();

  // convert polygon to a box. The type hint here is somehow inferred incorrectly
  (bFixtureDef.shape as any).SetAsBox(
    data.data[0] / 2,
    data.data[1] / 2
  );

  bBody.CreateFixture(bFixtureDef);
}

/**
 * Helper that creates a Box2D body based on `body`. The body will then be
 * added to the world at the given `position`.
 */
export function bCreateBody(bWorld: b2World, body: RigidBody, position: Vec2) {
  const bodyDef = new b2BodyDef();

  // If true the body won't be allowed to rotate. This will be the
  // case in most tiling games a.E.
  bodyDef.fixedRotation = !body.rotate;

  // The bodies initial position.
  bodyDef.position.Set(position[0], position[1]);

  bodyDef.linearVelocity.Set(
    body.velocity[0],
    body.velocity[1]
  );

  // assign body type
  switch (body.type) {
    case RigidBodyType.Dynamic:
      bodyDef.type = b2BodyType.b2_dynamicBody;
      break;
    case RigidBodyType.Kinetic:
      bodyDef.type = b2BodyType.b2_kinematicBody;
      break;
    default:
    case RigidBodyType.Static:
      bodyDef.type = b2BodyType.b2_staticBody;
      break;
  }

  // Create the Box2D body.
  return bWorld.CreateBody(bodyDef);
}
