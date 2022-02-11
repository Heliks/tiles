import { EventQueue } from '@heliks/tiles-engine';
import { ColliderContact } from './collider-contact';


export enum ContactEventType {
  /** Two body parts started colliding. */
  Begin,
  /** Two previously colliding body parts lost contact. */
  End
}

/**
 * Contact event payload.
 */
export interface ContactEvent {
  contact: ColliderContact;
  type: ContactEventType;
}

/**
 * Event queue that contains contact events between two physics colliders.
 *
 * @see ContactEvent
 */
export class ContactEvents extends EventQueue<ContactEvent> {}
