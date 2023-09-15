import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { Collider } from './collider';
import { ContactEvents } from './events';
import { MaterialManager } from './material';
import { Physics } from './physics';
import { PhysicsAdapter } from './physics-adapter';
import { RigidBody } from './rigid-body';
import { SyncBodies } from './sync-bodies';
import { SyncWorlds } from './sync-worlds';
import { UpdateWorld } from './update-world';


/**
 * Generic physics bundle.
 *
 * This module comes without built-in physics engine and is mostly agnostic in it's
 * API, so any kind of 2D physics engine should be compatible as long as there is an
 * adapter for it.
 */
export class PhysicsBundle implements Bundle {

  /**
   * @param adapter Physics adapter used to run the physics simulation.
   */
  constructor(private readonly adapter: PhysicsAdapter) {}
  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    if (! this.adapter) {
      throw new Error('A physics adapter must be configured.');
    }

    builder
      .component(RigidBody)
      .type(Collider)
      .provide(MaterialManager)
      .bundle(this.adapter)
      .singleton(Physics, container => {
        return container.make<Physics>(this.adapter.getPhysicsType());
      })
      .provide(ContactEvents)
      .system(UpdateWorld)
      .system(SyncWorlds)
      .system(SyncBodies)
  }

}
