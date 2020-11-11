/* eslint-disable new-cap */
import { b2BodyType, b2CircleShape, b2PolygonShape, b2Shape } from '@flyover/box2d';
import { Shape } from '../collider';
import { RigidBodyType } from '../rigid-body';
import { Circle } from '@heliks/tiles-math';

export function b2ParseShape(shape: Shape): b2Shape {
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

export function b2ParseBodyType(type: RigidBodyType): b2BodyType {
  // assign body type
  switch (type) {
    case RigidBodyType.Dynamic:
      return b2BodyType.b2_dynamicBody;
    case RigidBodyType.Kinematic:
      return b2BodyType.b2_kinematicBody;
    default:
    case RigidBodyType.Static:
      return b2BodyType.b2_staticBody;
  }
}
