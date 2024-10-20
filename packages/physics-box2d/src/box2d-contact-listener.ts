/* eslint-disable new-cap */
import { b2Contact, b2ContactListener } from '@heliks/box2d';
import { Injectable } from '@heliks/tiles-engine';
import { Collider, ColliderContact, ContactEvents, ContactEventType, RigidBody } from '@heliks/tiles-physics';
import { FixtureUserData } from './types';


/** Handles Box2D contact events and forwards them to the physics system. */
@Injectable()
export class Box2dContactListener extends b2ContactListener {

  constructor(protected readonly queue: ContactEvents) {
    super();
  }

  /** Removes the {@link ColliderContact} between the given `body` and `collider`. */
  public static remove(body: RigidBody, collider: Collider): void {
    const index = body.contacts.findIndex(item => item.colliderB.id === collider.id);

    if (~index) {
      const contact = body.contacts[index];

      body.contacts.splice(index, 1);

      // Push event to onContactEnd queue if available.
      body.onContact?.push({ contact, type: ContactEventType.End });
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

    Box2dContactListener.remove(dataA.body, dataB.collider);
    Box2dContactListener.remove(dataB.body, dataA.collider);
    
    this.push(dataA, dataB, ContactEventType.Begin);
  }

}
