import { contains, Inject, Injectable, ProcessingSystem, Transform, World } from '@heliks/tiles-engine';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';
import { RigidBody } from './rigid-body';

/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class SyncBodies extends ProcessingSystem {

  /**
   * @param adapter The physics adapter.
   */
  constructor(@Inject(ADAPTER_TK) private readonly adapter: PhysicsAdapter) {
    super(contains(RigidBody, Transform));
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies = world.storage(RigidBody);
    const transforms = world.storage(Transform);

    // Update entities with rigid bodies.
    for (const entity of this.group.entities) {
      this.adapter.updateEntityBody(
        entity,
        bodies.get(entity),
        transforms.get(entity)
      );
    }
  }

}
