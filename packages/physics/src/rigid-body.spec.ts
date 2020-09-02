import { Rectangle } from './collider';
import {  RigidBody } from './rigid-body';

describe('RigidBody', () => {
  it('should attach colliders', () => {
    const body = new RigidBody();

    body.attach(new Rectangle(0, 0));

    expect(body.colliders).toHaveLength(1);
  });

  it('should assign data to attached colliders', () => {
    const body = new RigidBody();

    body.attach(new Rectangle(0, 0), {
      sensor: true
    });

    expect(body.colliders[0].sensor).toBeTruthy();
  });
});
