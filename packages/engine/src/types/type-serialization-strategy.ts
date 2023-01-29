import { World } from '../ecs';

/**
 * Implementation for a {@link Type} serialization strategy.
 */
export interface TypeSerializationStrategy<T, D = unknown> {

  /**
   * Serializes an `instance` to produce the data format `D`.
   *
   * @param instance Instance of type `T` that should be serialized.
   * @param world World in which the component exists.
   */
  serialize(instance: T, world: World): D;

  /**
   * Deserializes the given `data` to create a component of type `C`.
   *
   * @param data Data that should be deserialized.
   * @param world World in which the component exists.
   */
  deserialize(data: D, world: World): T;

}
