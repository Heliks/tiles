import { AppBuilder, Bundle, Type } from '@heliks/tiles-engine';
import { EntityComposer } from './entity-composer';
import { EntityFactory } from './entity-factory';
import { Level } from './level';
import { LevelConfig } from './level-config';
import { LevelSetup } from './level-setup';
import { LEVEL_ENTITY_FACTORY, LevelSystem } from './level-system';


/** Configuration options for the {@link LevelBundle}. */
export interface LevelBundleConfig {
  factory?: Type<EntityFactory>;
}

/**
 * Enables the Tiles level system.
 *
 * The level system provides chunk-based map handling and culling, object creation
 * and serialization.
 */
export class LevelBundle implements Bundle {

  constructor(public readonly config: LevelBundleConfig = {}) {}

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    const factory = this.config.factory ?? EntityComposer;

    app
      .component(Level)
      .singleton(LEVEL_ENTITY_FACTORY, container => container.make(factory))
      .provide(LevelConfig)
      .system(LevelSetup)
      .system(LevelSystem);
  }

}
