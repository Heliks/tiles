import { v4 } from 'uuid';
import { ClassDecoratorType, Type } from './types';


/** String that contains a 128-bit UUID (Universally unique identifier). */
export type UUID = string;

/**
 * Maps a {@link Type} to a {@link UUID}.
 *
 * @internal
 */
const TYPE_IDS = new Map<Type | Function, UUID>();

/** Creates a random {@link UUID}. */
export function uuid(): string {
  return v4();
}

/**
 * Globally assigns a {@link UUID} to a {@link Type}.
 *
 * This is useful for types that need a global, unique identifier (GUID). Most commonly
 * used when it needs to be registered on some kind of registry, manager, etc later on.
 */
export function setTypeId(type: Type | Function, id: UUID): void {
  TYPE_IDS.set(type, id);
}

/**
 * Returns the globally unique {@link UUID} (GUID) of a {@link Type}. Throws an error
 * if that type has none.
 *
 * @see setTypeId
 */
export function getTypeId(type: Type | Function): UUID {
  const id = TYPE_IDS.get(type);

  if (! id) {
    throw new Error(`No UUID for type ${type.toString()}`);
  }

  return id;
}

/**
 * Decorator that globally assigns a `uuid` to a class type.
 *
 * ```ts
 *
 * @GUID('314a8f62-4e2d-48e5-a24c-1ff0edd716fd')
 * class Foo {}
 *
 * ```
 *
 * @see setTypeId
 */
export function GUID(id: UUID): ClassDecoratorType {
  return function setTypeIdDecorator(target: Type) {
    setTypeId(target, id);
  }
}
