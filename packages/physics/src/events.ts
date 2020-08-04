import { Entity, EventQueue } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';

export enum ContactEvent {
  /** Two body parts started colliding. */
  Begin,
  /** Two previously colliding body parts lost contact. */
  End
}

/** The meta-data that is emitted when a `ContactEvent` happens. */
export interface ContactEventBody {
  /** The entity that triggered the contact event. */
  entityA: Entity;
  /** The entity with which [[entityA]] collided. */
  entityB: Entity;
  bodyA: RigidBody;
  bodyB: RigidBody;

  /** Event type. */
  type: ContactEvent;
}

/** A custom event channel where contact events are pushed. */
export class ContactEvents extends EventQueue<ContactEventBody> {}
