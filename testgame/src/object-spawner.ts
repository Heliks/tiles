import { ObjectSpawner as BaseObjectSpawner } from './modules/world';
import { EntityBuilder } from '@heliks/tiles-engine';
import { Spawner } from './modules/spawner';

export const enum ObjectType {
  SPAWNER = 'spawner'
}

/**
 * Properties for objects of type "spawner".
 */
interface SpawnerObjectProperties {

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
   * The time it takes in seconds for the entity to be re-spawned after it has been
   * killed. A time of `0` means it is re-spawned instantly.
   */
  respawnTime?: number;

}

/**
 * Properties that can be attached to any kind of object. They behave the same
 * regardless of the object to which they are attached.
 */
interface BaseProperties {

}

/** @internal */
type ObjectProperties = BaseProperties & SpawnerObjectProperties;

export class ObjectSpawner extends BaseObjectSpawner {

  /** @internal */
  protected onObjectEntityCreated(entity: EntityBuilder, props: ObjectProperties, type?: ObjectType): void {
    if (type === ObjectType.SPAWNER) {
      entity.use(new Spawner(
        props.id,
        props.respawnTime,
        props.range
      ));
    }
  }

}
