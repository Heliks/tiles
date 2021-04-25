import { GameBuilder } from '@heliks/tiles-engine';
import { SpawnerManager } from './spawner-manager';
import { SpawnerSystem } from './spawner-system';

export class SpawnerModule {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(SpawnerManager)
      .system(SpawnerSystem)
  }

}
