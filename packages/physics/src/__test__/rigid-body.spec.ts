import { Rectangle } from '@heliks/tiles-engine';
import { Collider } from '../collider';
import { Material } from '../material';
import { RigidBody } from '../rigid-body';


describe('RigidBody', () => {
  describe('Colliders', () => {
    it('should be attached', () => {
      const body = new RigidBody();
      const coll = Collider.rect(100, 100);

      body.attach(coll);

      expect(body.colliders[0]).toBe(coll);
    });

    it('should inherit the bodies default material', () => {
      const body = new RigidBody();
      const coll = Collider.rect(0, 0);

      const material = new Material('foo', 1, 2, 3);

      body.material = material;
      body.attach(coll);

      expect(coll.material).toBe(material)
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

    it('should inherit the bodies collision group and mask', () => {
      const body = new RigidBody();
      const coll = new Collider(new Rectangle(1, 1));

      body.group = 1;
      body.mask = 4;

      body.attach(coll);

      expect(coll).toMatchObject({
        group: 1,
        mask: 4
      });
    });

    it('should not inherit collision group or mask if it was manually set on the collider', () => {
      const body = new RigidBody();
      const coll = new Collider(new Rectangle(1, 1));

      body.group = 1;
      body.mask = 2;

      coll.group = 4;
      coll.mask = 8;

      body.attach(coll);

      expect(coll.group).toBe(4);
      expect(coll.mask).toBe(8);
    });
  });
});
