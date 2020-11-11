import { GameBuilder, Module, vec2 } from '@heliks/tiles-engine';
import { parseConfig, PhysicsConfig, TK_PHYSICS_CONFIG } from './config';
import { ContactEvents } from './events';
import { Box2dWorld } from './box2d';
import { SyncBodies } from './sync-bodies';
import { SyncWorlds } from './sync-worlds';
import { UpdateWorld } from './update-world';
import { Physics } from './physics';

export class PhysicsModule implements Module {

  /**
   * @param config Configuration for physics module.
   */
  constructor(public readonly config: Partial<PhysicsConfig>) {}

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    const config = parseConfig(this.config);

    builder
      // Todo: Make this configurable
      .provide({
        token: Physics,
        value: new Box2dWorld(vec2(0, 0))
      })
      .provide({
        token: TK_PHYSICS_CONFIG,
        value: config
      })
      .provide(ContactEvents)
      .system(UpdateWorld)
      .system(SyncWorlds)
      .system(SyncBodies)
  }

}
