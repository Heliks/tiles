/* eslint-disable new-cap */
import { b2Contact, b2ContactListener } from '@flyover/box2d';
import { ContactEvent, ContactEvents, RigidBody } from '@heliks/tiles-physics';
import { Entity, World } from '@heliks/tiles-engine';


/** Listens to Box2D contact events and forwards them to an `EventQueue`. */
export class Box2dContactListener extends b2ContactListener {

  constructor(
    protected readonly queue: ContactEvents,
    protected readonly world: World
  ) {
    super();
  }

  /** @internal */
  private push(a: Entity, b: Entity, type: ContactEvent): void {
    const storage = this.world.storage(RigidBody);

    const bodyA = storage.get(a);
    const bodyB = storage.get(b);

    this.queue.push({
      bodyA,
      bodyB,
      entityA: a,
      entityB: b,
      type
    });

    this.queue.push({
      bodyA: bodyB,
      bodyB: bodyA,
      entityA: b,
      entityB: a,
      type
    });
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

    this.push(entityA, entityB, ContactEvent.Begin);
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

    // Todo: This is a race-condition with the entity world that already cleaned up the
    //  rigid bodies. This should be fixed because as of right now there is no
    //  ContactEvent.End if the entity is destroyed during the contact, but that
    //  information might be useful for certain systems.
    if (this.world.alive(entityA) && this.world.alive(entityB)) {
      this.push(entityA, entityB, ContactEvent.End);
    }
  }

}
