import { GameBuilder, Module, Provider } from '@heliks/tiles-engine';
import { ContactEvents } from './events';
import { SyncBodies } from './sync-bodies';
import { SyncWorlds } from './sync-worlds';
import { UpdateWorld } from './update-world';
import { PhysicsAdapter } from './physics-adapter';
import { Physics } from './physics';


/**
 * Generic physics module.
 *
 * This module comes without built-in physics engine and is mostly agnostic in it's
 * API, so any kind of 2D physics engine should be compatible as long as there is an
 * adapter for it.
 */
export class PhysicsModule implements Module {

  /**
   * @param adapter Physics adapter used to run the physics simulation.
   */
  constructor(private readonly adapter: PhysicsAdapter) {}

  /** @internal */
  private getPhysicsProvider(): Provider {
    const type = this.adapter.getPhysicsType();

    return {
      instantiate: typeof type === 'function',
      token: Physics,
      value: type
    };
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    if (! this.adapter) {
      throw new Error('A physics adapter must be configured.');
    }

    builder
      .module(this.adapter)
      .provide(this.getPhysicsProvider())
      .provide(ContactEvents)
      .system(UpdateWorld)
      .system(SyncWorlds)
      .system(SyncBodies)
  }

}
