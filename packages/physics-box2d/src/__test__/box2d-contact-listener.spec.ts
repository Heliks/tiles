import { B2Contact } from '@heliks/box2d';
import { Collider, ColliderContact, ContactEvents, ContactEventType, RigidBody } from '@heliks/tiles-physics';
import { Box2dContactListener } from '../box2d-contact-listener';
import { FixtureUserData } from '../types';


describe('Box2dContactListener', () => {
  // The listener only reads fixture user data from a Box2D contact. This stand-in
  // lets us trigger contact callbacks without running a physics simulation.
  function contact(a: FixtureUserData, b: FixtureUserData): B2Contact {
    return {
      GetFixtureA: () => ({
        GetUserData: () => a
      }),
      GetFixtureB: () => ({
        GetUserData: () => b
      })
    } as unknown as B2Contact;
  }

  function createUserData(entity: number, body: RigidBody, collider: Collider): FixtureUserData {
    return {
      body,
      collider,
      entity
    };
  }

  let body: RigidBody;

  let listener: Box2dContactListener;
  let queue: ContactEvents;

  beforeEach(() => {
    body = new RigidBody();

    queue = new ContactEvents();
    listener = new Box2dContactListener(queue);
  });

  it('should preserve contacts with the same collider when one contact ends', () => {
    const body0 = new RigidBody();
    const body1 = new RigidBody();

    // Entity 1 has two colliders, both touching the single collider on entity 2.
    const collider0 = Collider.rect(10, 10);
    const collider1 = Collider.rect(5, 5);

    const data0 = createUserData(1, body0, collider0);
    const data1 = createUserData(1, body0, collider1);
    const data3 = createUserData(2, body1, Collider.rect(5, 5));

    const contact0 = contact(data0, data3);
    const contact1 = contact(data1, data3);

    listener.BeginContact(contact0);
    listener.BeginContact(contact1);

    // Trigger the end of the contact.
    listener.EndContact(contact1);

    // Each body stores its own view of a contact: colliderA is local, colliderB
    // belongs to the opposing body. Both views must retain the same surviving pair.
    expect(body0.contacts).toMatchObject([
      {
        colliderA: collider0
      }
    ]);

    expect(body1.contacts).toMatchObject([
      {
        colliderB: collider0
      }
    ]);
  });

  it('should emit an end event when contact ends', () => {
    const subscription = queue.subscribe();

    const body0 = new RigidBody();
    const body1 = new RigidBody();

    const collider0 = Collider.rect(5, 5);
    const collider1 = Collider.rect(5, 5);

    const data0 = createUserData(1, body0, collider0);
    const data1 = createUserData(2, body1, collider1);

    const contact0 = contact(data0, data1);

    listener.BeginContact(contact0);

    // Consume the Begin event so the assertion checks only the next callback.
    subscription.read();

    listener.EndContact(contact0);

    expect(subscription.size()).toBe(1);
    expect(subscription.next()).toMatchObject({
      type: ContactEventType.End,
    });
  });

  describe('remove()', () => {
    it('should preserve contact with another collider instance sharing the same serialized ID', () => {
      const collider = Collider.rect(5, 5);
      const first = Collider.rect(5, 5);
      const second = Collider.rect(5, 5);

      // Separate entities loaded from the same definition can share collider IDs.
      // Reproduce that here while keeping the collider instances distinct.
      Object.assign(second, { id: first.id });

      const remaining = new ColliderContact(1, 2, collider, first);

      body.contacts.push(remaining, new ColliderContact(1, 3, collider, second));

      // Ending contact with entity 3 must not remove the contact with entity 2,
      // even though their colliders have the same ID.
      Box2dContactListener.remove(body, collider, second);

      expect(body.contacts).toEqual([remaining]);
    });

    it('should remove contact event of the given collider', () => {
      const colliderA = Collider.rect(10, 10);
      const colliderB = Collider.rect(10, 10);

      const entityA = 1;
      const entityB = 2;

      body.attach(colliderA);

      // Seed one contact directly to test removal independently of BeginContact.
      // Entity 1 owns colliderA; entity 2 owns colliderB.
      body.contacts.push(new ColliderContact(
        entityA,
        entityB,
        colliderA,
        colliderB
      ));

      Box2dContactListener.remove(body, colliderA, colliderB);

      expect(body.contacts).toHaveLength(0);
    });
  });
});
