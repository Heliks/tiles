import { v4, v5 } from 'uuid';


/** Type alias for a string in a UUID format. */
export type UUID = string;

/**
 * Namespace used to generate v5 UUIDs.
 *
 * @see uuid()
 */
const UUID_NAMESPACE = '06d8878c-8305-44f2-8bca-98b311f857dd';

/**
 * Creates a random UUID (Universally Unique Identifiers). If a `seed` is given an RFC
 * version 5 (namespace with SHA-1) UUID will be created instead.
 *
 * @see https://de.wikipedia.org/wiki/Universally_Unique_Identifier
 */
export function uuid(seed?: string | number): string {
  return (seed ? v5(seed.toString(), UUID_NAMESPACE) : v4()).toString();
}
