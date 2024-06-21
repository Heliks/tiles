/* eslint-disable new-cap */
import { b2Contact, b2ContactListener } from '@heliks/box2d';
import { World } from '@heliks/tiles-engine';
import { ColliderContact, ContactEvents, ContactEventType } from '@heliks/tiles-physics';
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
  public static onContactEnd(fixtureData: FixtureUserData): void {
    const index = fixtureData.body.contacts.findIndex(item => Boolean(
      item.colliderA.id === fixtureData.collider.id &&
      item.entityA === fixtureData.entity
    ));

    if (~index) {
      const contact = fixtureData.body.contacts[index];

      fixtureData.body.contacts.splice(index, 1);

      // Push event to onContactEnd queue if available.
      fixtureData.body.onContact?.push({ contact, type: ContactEventType.End });
    }
  }

  /** @internal */
  private push(a: FixtureUserData, b: FixtureUserData, type: ContactEventType): void {
    // Avoid creating useless objects when no one is listening.
    if (this.queue.size() > 0) {
      this.queue.push({
        contact: new ColliderContact(
          a.entity,
          b.entity,
          a.collider,
          b.collider
        ),
        type
      });
    }
  }

  /** @inheritDoc */
  public BeginContact(contact: b2Contact): void {
    const dataA = contact.GetFixtureA().GetUserData();
    const dataB = contact.GetFixtureB().GetUserData();

    const contactA = new ColliderContact(dataA.entity, dataB.entity, dataA.collider, dataB.collider);
    const contactB = new ColliderContact(dataB.entity, dataA.entity, dataB.collider, dataA.collider);

    dataA.body.contacts.push(contactA);
    dataB.body.contacts.push(contactB);

    dataA.body.onContact?.push({ contact: contactA, type: ContactEventType.Begin });
    dataB.body.onContact?.push({ contact: contactB, type: ContactEventType.Begin });

    this.push(dataA, dataB, ContactEventType.Begin);
  }

  /** @inheritDoc */
  public EndContact(contact: b2Contact): void {
    const dataA = contact.GetFixtureA().GetUserData();
    const dataB = contact.GetFixtureB().GetUserData();

    Box2dContactListener.onContactEnd(dataA);
    Box2dContactListener.onContactEnd(dataB);
    
    this.push(dataA, dataB, ContactEventType.Begin);
  }

}
