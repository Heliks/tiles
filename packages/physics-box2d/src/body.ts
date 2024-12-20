/* eslint-disable new-cap */

import { b2Body } from '@heliks/box2d';
import { Transform } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';


export function syncBodyVelocity(body: b2Body, component: RigidBody): void {
  const velocity = body.GetLinearVelocity();


  if (component._velocity.read()) {
    body.SetLinearVelocity(component.getVelocity());
  }

  component._velocity.value.x = velocity.x;
  component._velocity.value.y = velocity.y;
}

export function syncBodyPosition(body: b2Body, component: RigidBody, transform: Transform): void {
  const position = body.GetPosition();

  if (component._position.read()) {
    position.Set(transform.world.x, transform.world.y);
  }
  else {
    transform.world.x = position.x;
    transform.world.y = position.y;
  }
}

export function syncBodyRotation(body: b2Body, component: RigidBody, transform: Transform): void {
  if (component.rotate) {
    transform.rotation = body.GetAngle();
  }
  else {
    body.SetAngle(transform.rotation);
  }
}
