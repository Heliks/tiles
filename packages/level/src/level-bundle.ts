import { AppBuilder, Bundle, Type } from '@heliks/tiles-engine';
import { ChunkLoader } from './chunk-loader';
import { Level } from './level';
import { LevelConfig } from './level-config';
import { LevelSetup } from './level-setup';
import { LEVEL_ENTITY_FACTORY, LevelSystem } from './level-system';
import { ObjectsComposer } from './objects-composer';
import { ObjectsFactory } from './objects-factory';
import { Persistent } from './persistent';


/** Configuration options for the {@link LevelBundle}. */
export interface LevelBundleConfig {
  factory?: Type<ObjectsFactory>;
  /** Chunk loader used by all level systems. */
  loader?: Type<ChunkLoader>;
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
    const factory = this.config.factory ?? ObjectsComposer;
    const loader = this.config.loader ?? ChunkLoader;

    app
      .component(Level)
      .type(Persistent)
      .singleton(LEVEL_ENTITY_FACTORY, container => container.make(factory))
      .provide(LevelConfig)
      .singleton(ChunkLoader, container => container.make(loader))
      .system(LevelSetup)
      .system(LevelSystem);
  }

}
