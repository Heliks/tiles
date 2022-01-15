/* eslint-disable new-cap */
import { b2Contact, b2ContactListener } from '@flyover/box2d';
import { World } from '@heliks/tiles-engine';
import { ContactEvents, ContactEventType } from '@heliks/tiles-physics';
import { FixtureUserData } from './types';


/** Listens to Box2D contact events and forwards them to an `EventQueue`. */
export class Box2dContactListener extends b2ContactListener {

  constructor(
    protected readonly queue: ContactEvents,
    protected readonly world: World
  ) {
    super();
  }

  /** @internal */
  private push(a: FixtureUserData, b: FixtureUserData, type: ContactEventType): void {
    this.queue.push({
      bodyA: a.body,
      bodyB: b.body,
      colliderA: a.collider,
      colliderB: b.collider,
      entityA: a.entity,
      entityB: b.entity,
      type
    });
  }

  /** @inheritDoc */
  public BeginContact(contact: b2Contact): void {
    const dataA = contact.GetFixtureA().GetUserData();
    const dataB = contact.GetFixtureB().GetUserData();

    dataA.collider.addContact(dataB.entity, dataB.collider.id);
    dataB.collider.addContact(dataA.entity, dataA.collider.id);

    this.push(dataA, dataB, ContactEventType.Begin);
  }

  /** @inheritDoc */
  public EndContact(contact: b2Contact): void {
    const dataA = contact.GetFixtureA().GetUserData();
    const dataB = contact.GetFixtureB().GetUserData();

    dataA.collider.removeContact(dataB.entity, dataB.collider.id);
    dataB.collider.removeContact(dataA.entity, dataA.collider.id);

    this.push(dataA, dataB, ContactEventType.Begin);
  }

}
