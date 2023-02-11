import { parse, stringify, v4, v5 } from 'uuid';
import { Type } from './types';


/** String that contains a 128-bit UUID (Universally unique identifier). */
export type UUID = string;

/** @internal */
type Ctor = Type | Function;

/**
 * Namespace used by {@link Uuid} to generate uuids from a seed string.
 *
 * @internal
 */
const UUID_NAMESPACE = '0fd91390-0b98-4c7d-a434-84a153c8bbb4';

/** Utility to work with {@link UUID UUIDs}. */
export class Uuid {

  /** @internal */
  private static readonly types = new Map<Ctor, UUID>();

  /** Creates a random {@link UUID}. */
  public static create(str?: string): UUID {
    return str ? v5(str, UUID_NAMESPACE) : v4();
  }

  /** Converts a `uuid` to a byte array. */
  public static bytes(uuid: UUID): ArrayLike<number> {
    return parse(uuid);
  }

  /** Converts the byte array `bytes` to a {@link UUID}. */
  public static stringify(bytes: ArrayLike<number>): UUID {
    return stringify(bytes);
  }

  /**
   * Globally assigns a {@link UUID} to a {@link Type}.
   *
   * This is useful for types that need a global, unique identifier (GUID). Most commonly
   * used when it needs to be registered on some kind of registry, manager, etc later on.
   */
  public static setTypeId(type: Ctor, id: UUID): void {
    Uuid.types.set(type, id);
  }

  /**
   * Returns the globally unique {@link UUID} (GUID) of a {@link Type}. Throws an error
   * if that type has none.
   *
   * @see setTypeId
   */
  public static getTypeId(type: Ctor): UUID {
    const id = Uuid.types.get(type);

    if (! id) {
      throw new Error(`No UUID for type ${type.toString()}`);
    }

    return id;
  }

}
