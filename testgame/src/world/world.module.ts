import { GameBuilder } from '@heliks/tiles-engine';
import { GameMapManager } from './game-map-manager';
import { MapHierarchy } from './map-hierarchy';
import { MapSpawner } from './map-spawner';

export class WorldModule {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(MapHierarchy)
      .provide(MapSpawner)
      .provide(GameMapManager);
  }

}
