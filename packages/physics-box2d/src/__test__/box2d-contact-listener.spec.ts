import { Collider, ColliderContact, RigidBody } from '@heliks/tiles-physics';
import { Box2dContactListener } from '../box2d-contact-listener';


describe('Box2dContactListener', () => {
  describe('remove()', () => {
    it('should remove contact event of the given collider', () => {
      const body = new RigidBody();

      const colliderA = Collider.rect(10, 10);
      const colliderB = Collider.rect(10, 10);

      const entityA = 1;
      const entityB = 2;

      body.attach(colliderA);

      body.contacts.push(new ColliderContact(
        entityA,
        entityB,
        colliderA,
        colliderB
      ));

      Box2dContactListener.remove(body, colliderB);

      expect(body.contacts).toHaveLength(0);
    });
  });
});
