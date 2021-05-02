import { ClassType, GameBuilder } from '@heliks/tiles-engine';
import { MapManager } from './map-manager';
import { MapHierarchy } from './map-hierarchy';
import { MapSpawner } from './map-spawner';
import { ObjectSpawner } from './object-spawner';
import { DefaultObjectSpawner } from './default-object-spawner';

export class WorldModule {

  /**
   * Contains a custom object spawner (if set via `setObjectSpawner()`). If this is
   * not set when on module `build()` the default object spawner is used.
   */
  private customObjectSpawner?: ClassType<ObjectSpawner>;

  /** Registers a custom object spawner. */
  public setObjectSpawner(spawner: ClassType<ObjectSpawner>): this {
    this.customObjectSpawner = spawner;

    return this;
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide({
      instantiate: true,
      token: ObjectSpawner,
      value: this.customObjectSpawner ?? DefaultObjectSpawner
    });

    builder
      .provide(MapHierarchy)
      .provide(MapSpawner)
      .provide(MapManager);
  }

}
