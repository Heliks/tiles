import { World } from '../ecs';
import { TypeRegistry } from './type-registry';


/**
 * Format for a serialized {@link Type}. The format maps the output data that is produced
 * by the types own {@link TypeSerializationStrategy serialization strategy} to the id
 * with which it is registered on the {@link TypeRegistry}.
 */
export interface TypeData<D = unknown> {
  $type: string;
  $data: D;
}

/** Returns `true` if `value` contains {@link TypeData}. */
export function isTypeData(value: unknown): value is TypeData {
  const _value = value as TypeData;

  return Boolean(_value.$type && _value.$data);
}

export function serializeTypeValue(world: World, types: TypeRegistry, value: object): TypeData {
  const entry = types.entry(value.constructor);

  return {
    $data: entry.strategy.serialize(value, world),
    $type: entry.id
  };
}

export function deserializeTypeData(world: World, types: TypeRegistry, data: TypeData): object {
  return types
    .entry<object>(data.$type)
    .strategy
    .deserialize(data.$data, world);
}

