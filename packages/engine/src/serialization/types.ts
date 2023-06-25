import { World, Entity, EntityBuilder } from '../ecs';
import { Struct } from '../utils';

/**
 * Serialized entity data that is stringify-able via `JSON.stringify()`. Each key in
 * this object is the namespace of a component.
 */
export type EntityData = Struct;


/**
 * Responsible for de-/serializing entities.
 */
export interface EntitySerializer {

  /**
   * Serializes an `entity`.
   *
   * @param world World in which the entity exists.
   * @param entity Entity that should be serialized.
   */
  serialize(world: World, entity: Entity): EntityData;

  /**
   * Deserializes entity `data` and produces an entity.
   *
   * @param world World to which the deserialized entity should be created.
   * @param data Entity data to deserialize.
   */
  deserialize(world: World, data: EntityData): EntityBuilder;

}