import { Query } from '@tiles/entity-system';
import { ProcessingSystem, Transform, World } from '@tiles/engine';
import { RigidBody } from './rigid-body';
import { Inject, Injectable } from '@tiles/injector';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';

/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class SyncBodies extends ProcessingSystem {

  /**
   * @param adapter The physics adapter.
   */
  constructor(@Inject(ADAPTER_TK) private readonly adapter: PhysicsAdapter) {
    super();
  }

  /** @inheritDoc */
  public getQuery(): Query {
    return {
      contains: [
        RigidBody,
        Transform
      ]
    };
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies  = world.storage(RigidBody);
    const transforms = world.storage(Transform);

    // Update entities with rigid bodies.
    for (const entity of this.group.entities) {
      this.adapter.updateBody(
        entity,
        bodies.get(entity),
        transforms.get(entity)
      );
    }
  }

}
