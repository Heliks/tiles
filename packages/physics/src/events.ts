import { Entity, EventQueue } from '@heliks/tiles-engine';
import { Collider } from './collider';


export enum ContactEvent {
  /** Two body parts started colliding. */
  Begin,
  /** Two previously colliding body parts lost contact. */
  End
}

/**
 * Contact event payload.
 */
export interface ContactEventBody {
  colliderA: Collider;
  colliderB: Collider;
  entityA: Entity;
  entityB: Entity;
  type: ContactEvent;
}

/**
 * Event queue that contains contact events between two physics colliders.
 *
 * @see ContactEvent
 */
export class ContactEvents extends EventQueue<ContactEventBody> {}
