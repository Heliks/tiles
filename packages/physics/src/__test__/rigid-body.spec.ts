import { Rectangle } from '@heliks/tiles-math';
import { Collider } from '../collider';
import { RigidBody } from '../rigid-body';

describe('RigidBody', () => {
  describe('Colliders', () => {
    it('should be attached', () => {
      const body = new RigidBody();
      const coll = Collider.rect(100, 100);

      body.attach(coll);

      expect(body.colliders[0]).toBe(coll);
    });

    it('should be attached using shapes', () => {
      const body = new RigidBody();

      body.attach(new Rectangle(0, 0));

      expect(body.colliders).toHaveLength(1);
    });

    it('should have data assigned when they are created from shapes', () => {
      const body = new RigidBody();

      body.attach(new Rectangle(0, 0), {
        sensor: true
      });

      expect(body.colliders[0].sensor).toBeTruthy();
    });
  });
});
