/**
 * An entity identifier to which components can be attached.
 *
 * The 32 bit `number` type is split into two parts, one being the index that the entity
 * occupies in memory, and the second is the version, or the "generation" in which the
 * entity exists.
 *
 * For simplicities sake lets pretend the entity is an 8 bit identifier instead, where the
 * last two bits are reserved for the version:
 *
 * Entity = 00100100
 *          001001[00] <-- steal two bits for version
 *
 * Which leaves us with an index part 001001 (9) for the entity index, and 00 (0) for the
 * entity version.
 */
export type Entity = number;

// The amount of bits reserved on the 32 bit entity identifier to store the index
// position. By reserving 20 bits the maximum amount of entities that can be alive at the
// same time is limited to 1048575, which should be enough for most games.
export const ENTITY_BITS = 20;

// Mask used to extract the index part of an entity identifier.
export const ENTITY_MASK = 0xFFFFF;

/** Returns the ID of `entity`. The ID is simultaneously the index that it occupies. */
export function entityId(entity: Entity): number {
  return entity & ENTITY_MASK;
}

/** Returns the version of `entity`. */
export function entityVersion(entity: Entity): number {
  return entity >> ENTITY_BITS;
}
