import { GameBuilder, Module } from '@tiles/engine';
import { parseConfig, PhysicsConfig, TK_PHYSICS_CONFIG } from './config';
import { ContactEvents } from './events';
import { ADAPTER_TK } from './physics-adapter';
import { Box2dWorld } from './box2d';
import { SyncBodies } from './sync-bodies';
import { SyncWorlds } from './sync-worlds';
import { PhysicsSystem } from './physics-system';

export class PhysicsModule implements Module {

  /**
   * @param config Configuration for physics module.
   */
  constructor(public readonly config: Partial<PhysicsConfig>) {}

  /** {@inheritDoc} */
  public build(builder: GameBuilder): void {
    const config = parseConfig(this.config);

    builder
      // Todo: Make this configurable
      .provide({
        token: ADAPTER_TK,
        value: new Box2dWorld([0, 0])
      })
      .provide({
        token: TK_PHYSICS_CONFIG,
        value: config
      })
      .provide(ContactEvents)
      .system(SyncWorlds)
      .system(SyncBodies)
      .system(PhysicsSystem)
  }

}
