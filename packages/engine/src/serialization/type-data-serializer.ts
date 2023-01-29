import { World } from '../ecs';
import { deserializeTypeData, serializeTypeValue, TypeData, TypeRegistry } from '../types';


/** Deserializes {@link Type types} known to the {@link TypeRegistry}. */
export class TypeDataSerializer {

  /**
   * @param types {@see TypeRegistry}
   */
  constructor(private readonly types: TypeRegistry) {}

  /** Serializes a `value` that is an instance of a {@link Type type}. */
  public serialize(world: World, value: object): TypeData {
    return serializeTypeValue(world, this.types, value);
  }

  /** De-serializes type `data`. */
  public deserialize(world: World, data: TypeData): object {
    return deserializeTypeData(world, this.types, data);
  }

}
