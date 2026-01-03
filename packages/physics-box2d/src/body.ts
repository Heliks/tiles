/* eslint-disable new-cap */
import { B2Body } from '@heliks/box2d';
import { Transform, Vec2 } from '@heliks/tiles-engine';
import { RigidBody } from '@heliks/tiles-physics';


export function syncBodyVelocity(body: B2Body, component: RigidBody): void {
  const velocity = body.GetLinearVelocity();

  if (component._velocity.read()) {
    // If user has manually set the velocity.
    body.SetLinearVelocity(component.getVelocity());
  }
  else if (component.constraint) {
    const dot = Vec2.dot(velocity, component.constraint);

    velocity.Set(
      component.constraint.x * dot,
      component.constraint.y * dot
    );

    body.SetLinearVelocity(velocity);
  }

  component._velocity.value.x = velocity.x;
  component._velocity.value.y = velocity.y;
}

export function syncBodyPosition(body: B2Body, component: RigidBody, transform: Transform): void {
  const position = body.GetPosition();

  if (component._position.read()) {
    position.Set(transform.world.x, transform.world.y);
  }
  else {
    transform.world.x = position.x;
    transform.world.y = position.y;
  }
}

export function syncBodyRotation(body: B2Body, component: RigidBody, transform: Transform): void {
  if (component.rotate) {
    transform.rotation = body.GetAngle();
  }
  else {
    body.SetAngle(transform.rotation);
  }
}

export function syncBodyForce(body: B2Body, component: RigidBody): void {
  if (! component._force.read()) {
    return;
  }

  const force = component._force.value;

  if (component.constraint) {
    const dot = force.dot(component.constraint);

    force
      .copy(component.constraint)
      .scale(dot);
  }

  body.ApplyForceToCenter(force, true);
}
