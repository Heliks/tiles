/* eslint-disable new-cap */
import { b2Contact, b2ContactListener } from '@flyover/box2d';
import { World } from '@heliks/tiles-engine';
import { ContactEvent, ContactEvents } from '@heliks/tiles-physics';


/** Listens to Box2D contact events and forwards them to an `EventQueue`. */
export class Box2dContactListener extends b2ContactListener {

  constructor(
    protected readonly queue: ContactEvents,
    protected readonly world: World
  ) {
    super();
  }

  /** @inheritDoc */
  public BeginContact(contact: b2Contact): void {
    const fixtureA = contact.GetFixtureA();
    const fixtureB = contact.GetFixtureB();

    const colliderA = fixtureA.GetUserData();
    const colliderB = fixtureB.GetUserData();

    const entityA = fixtureA.GetBody().GetUserData();
    const entityB = fixtureB.GetBody().GetUserData();

    colliderA.collider.addContact(entityB, colliderB.collider.id);
    colliderB.collider.addContact(entityA, colliderA.collider.id);

    this.queue.push({
      colliderA,
      colliderB,
      entityA,
      entityB,
      type: ContactEvent.Begin
    });
  }

  /** @inheritDoc */
  public EndContact(contact: b2Contact): void {
    const fixtureA = contact.GetFixtureA();
    const fixtureB = contact.GetFixtureB();

    const colliderA = fixtureA.GetUserData();
    const colliderB = fixtureB.GetUserData();

    const entityA = fixtureA.GetBody().GetUserData();
    const entityB = fixtureB.GetBody().GetUserData();

    colliderA.collider.removeContact(entityB, colliderB.collider.id);
    colliderB.collider.removeContact(entityA, colliderA.collider.id);

    this.queue.push({
      colliderA,
      colliderB,
      entityA,
      entityB,
      type: ContactEvent.End
    });
  }

}
