import { contains, Injectable, ProcessingSystem, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';
import { Physics } from './physics';

/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class SyncBodies extends ProcessingSystem {

  /**
   * @param adapter The physics adapter.
   */
  constructor(private readonly adapter: Physics) {
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
