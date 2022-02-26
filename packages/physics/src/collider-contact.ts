import { Entity } from '@heliks/tiles-engine';
import { Collider } from './collider';


/**
 * Describes the contact that occurs between two colliders.
 *
 * @see Collider
 */
export class ColliderContact {

  /**
   * @param entityA First entity in the contact. Owns the rigid body that has `colliderA` attached.
   * @param entityB Second entity in the contact. Owns the rigid body that has `colliderB` attached.
   * @param colliderA Collider that had a collision event with `colliderB`.
   * @param colliderB Collider that had a collision event with `colliderA`.
   */
  constructor(
    public readonly entityA: Entity,
    public readonly entityB: Entity,
    public readonly colliderA: Collider,
    public readonly colliderB: Collider
  ) {}

}
