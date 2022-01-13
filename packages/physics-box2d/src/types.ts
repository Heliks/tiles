import { Entity } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';


export interface FixtureUserData {
  body: RigidBody;
  collider: Collider;
  entity: Entity;
}