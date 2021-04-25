import { GameBuilder } from '@heliks/tiles-engine';
import { MapManager } from './map-manager';
import { MapHierarchy } from './map-hierarchy';
import { MapSpawner } from './map-spawner';
import { ObjectType, ObjectTypes } from './object-types';

export class WorldModule {

  /** @internal */
  private readonly objectTypes = new ObjectTypes();

  /** Registers an object type. */
  public use(type: string, klass: ObjectType): this {
    this.objectTypes.set(type, klass);

    return this;
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide({
        token: ObjectTypes,
        value: this.objectTypes
      })
      .provide(MapHierarchy)
      .provide(MapSpawner)
      .provide(MapManager);
  }

}
