import { Struct, Type } from '../utils/types';
import { isIgnored } from './ignore';
import { World } from '../ecs';
import { deserializeTypeData, isTypeData, serializeTypeValue } from './type-data';
import { TypeRegistry } from './type-registry';
import { TypeSerializationStrategy } from './type-serialization-strategy';


/** Serialized data structure produced by a {@link TypeSerializer}. */
export type DefaultSerializerData<T> = {
  [P in keyof T]: T[P] extends Function ? never : T[P]
};

/** @internal */
function _serializeObject(world: World, value: object): unknown {
  const types = world.get(TypeRegistry);

  if (types.has(value.constructor)) {
    const data = serializeTypeValue(world, types, value);

    if (data) {
      return data;
    }
  }

  return value;
}

/** @internal */
function serializeArray(world: World, items: unknown[]): unknown[] {
  return items.map(item => typeof item === 'object' ? _serializeObject(world, item as object) : item);
}

/** @internal */
function serializeObject(world: World, value: object): unknown {
  return Array.isArray(value)
    ? serializeArray(world, value)
    : _serializeObject(world, value);
}

/** @internal */
function deserializeArray(world: World, types: TypeRegistry, items: unknown[]): unknown {
  return items.map(item => isTypeData(item) ? deserializeTypeData(world, types, item) : item);
}

/** Default {@link TypeSerializationStrategy} used by most types. */
export class TypeSerializer<C> implements TypeSerializationStrategy<C, DefaultSerializerData<C>> {

  /**
   * @param type Component type that will be serialized.
   */
  constructor(public readonly type: Type<C>) {}

  /** @inheritDoc */
  public serialize(instance: C, world: World): DefaultSerializerData<C> {
    const data: Struct = {}

    for (const key in instance) {
      if (isIgnored(instance, key)) {
        continue;
      }

      const value = instance[key];

      // Ignore undefined/null property.
      if (value === undefined || value === null) {
        continue;
      }

      const type = typeof value;

      // Do not serialize functions.
      if (type === 'function') {
        continue;
      }

      if (type === 'object') {
        data[key] = serializeObject(world, value);
      }
      else {
        data[key] = value;
      }
    }

    return data as DefaultSerializerData<C>;
  }

  /** @inheritDoc */
  public deserialize(data: DefaultSerializerData<C>, world: World): C {
    const types = world.get(TypeRegistry);

    // Safety: Sadly there is no way to correctly check if the typing matches at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, new-cap
    const instance = (new this.type()) as any;

    for (const key in data) {
      const value = data[key];

      if (Array.isArray(value)) {
        instance[key] = deserializeArray(world, types, value);

        continue;
      }

      if (isTypeData(value)) {
        instance[key] = deserializeTypeData(world, types, value);

        continue;
      }

      instance[key] = value;
    }

    return instance;
  }

}
