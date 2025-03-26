/* eslint-disable new-cap */
import { B2BodyType, B2CircleShape, B2PolygonShape, B2Shape } from '@heliks/box2d';
import { Circle } from '@heliks/tiles-engine';
import { ColliderShape, RigidBodyType } from '@heliks/tiles-physics';


export function B2ParseShape(shape: ColliderShape): B2Shape {
  // Circles.
  if (shape instanceof Circle) {
    return new B2CircleShape().Set(shape, shape.radius);
  }

  const box = new B2PolygonShape();

  // Convert the polygon to a box.
  box.SetAsBox(
    shape.width / 2,
    shape.height / 2,
    shape
  );

  return box;
}

export function B2ParseBodyType(type: RigidBodyType): B2BodyType {
  // assign body type
  switch (type) {
    case RigidBodyType.Dynamic:
      return B2BodyType.B2_dynamicBody;
    case RigidBodyType.Kinematic:
      return B2BodyType.B2_kinematicBody;
    default:
    case RigidBodyType.Static:
      return B2BodyType.B2_staticBody;
  }
}
