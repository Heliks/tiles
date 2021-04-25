import { EntityBuilder } from '@heliks/tiles-engine';
import { ObjectType } from '../world/object-types';
import { Spawner } from './spawner';

export interface SpawnerOptions {

  /**
   * Id of the blueprint that should be used to spawn entities.
   */
  id: string;

  /**
   * The range around the spawner where entities can be spawned. The exact spawning
   * location is a random position in that range. A range of `0` means the entity is
   * spawned on top of the spawner.
   */
  range?: number;

  /**
   * The time it takes for the entity to be re-spawned after it has been killed. A time
   * of `0` means it is re-spawned instantly.
   */
  respawnTime?: number;

}

/** Attaches `Spawner` components to objects that are of a spawner type. */
export class SpawnerObject implements ObjectType<SpawnerOptions> {

  /** @inheritDoc */
  public onSpawn(entity: EntityBuilder, properties: SpawnerOptions): void {
    entity.use(new Spawner(
      properties.id,
      properties.respawnTime,
      properties.range
    ));
  }

}
