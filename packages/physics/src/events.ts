import { Entity, EventQueue } from '@heliks/tiles-engine';
import { Collider } from './collider';
import { RigidBody } from './rigid-body';


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
  bodyA: RigidBody;
  bodyB: RigidBody;
  colliderA: Collider;
  colliderB: Collider;
  entityA: Entity;
  entityB: Entity;
  type: ContactEventType;
}

/**
 * Event queue that contains contact events between two physics colliders.
 *
 * @see ContactEvent
 */
export class ContactEvents extends EventQueue<ContactEvent> {}
