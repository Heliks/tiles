
import { TypeSerializationStrategy } from './type-serialization-strategy';
import { Type } from '../utils/types';


/** The entry of a {@link Type} that is registered on the {@link TypeRegistry}. */
export interface TypeEntry<T = unknown> {
  id: string;
  type: T;
  strategy: TypeSerializationStrategy<T>;
}

/**
 * Manages class {@link Type types} and their serialization strategies.
 *
 * Each type is assigned an ID that it uses as a namespace for serialization. This ID
 * must be unique across all types in a registry.
 */
export class TypeRegistry {

  /** @internal */
  private lookup = new Map<string, TypeEntry>();

  /** @internal */
  private entries = new Map<Type, TypeEntry>();

  /**
   * Registers a serialization `strategy` for a class `type`. Throws an error if the
   * type is already registered of if the given ID is already in use.
   */
  public register<T>(type: Type<T>, strategy: TypeSerializationStrategy<T>, id: string): this {
    if (this.entries.has(type)) {
      throw new Error(`Type ${type.name} is already registered.`);
    }

    if (this.lookup.has(id)) {
      throw new Error(`Name ${id} is already used by another type.`);
    }

    const entry = {
      id,
      strategy,
      type
    };

    this.entries.set(type, entry);
    this.lookup.set(id, entry);

    return this;
  }

  /** Returns `true` if the given `type` is registered. */
  public has(type: Type | Function): boolean {
    return this.entries.has(type as Type);
  }

  /**
   * Returns the {@link TypeEntry} that is using the given `id`. Throws an error if no
   * entry with that ID exists.
   */
  public entry<T = unknown>(id: string): TypeEntry<T>;

  /**
   * Returns the {@link TypeEntry} for the given {@link Type}. Throws an error if no
   * entry for that type exists.
   */
  public entry<T>(type: Type<T> | Function): TypeEntry<T>;

  /** @internal */
  public entry<T>(typeOrId: Type | Function | string): TypeEntry<T> {
    const entry = typeof typeOrId === 'string'
      ? this.lookup.get(typeOrId)
      : this.entries.get(typeOrId as Type);

    if (! entry) {
      throw new Error(`No type entry for ${typeOrId.toString()}`);
    }

    return entry as TypeEntry<T>;
  }

}
