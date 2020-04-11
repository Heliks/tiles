import { BitSet } from "./bit-set";
import { Entity, Query } from "./types";
import { EntityGroup } from "./entity-group";

// The amount of bits we steal from an entity to store its own version.
export const VERSION_BITS = 4;

// Integer value containing the highest possible index an entity can have. Naturally
// this is also the limit of how many entities are possible to exist at once.
export const MAX_INDEX = 0xFFFFFFF >> VERSION_BITS;

/**
 * A bit set that contains the Ids of all components that are contained in this composition.
 * The entity manager will store a composition for each entity.
 */
export type Composition = BitSet;

/**
 * Manages entities.
 */
export class EntityManager {

  /** Contains all existing entities, both living ones and destroyed ones. */
  public readonly entities: Entity[] = [];

  /** Bit sets that hold the composition of an entity. */
  protected readonly compositions = new Map<Entity, Composition>();

  /**
   * Contains entities that had their composition recently updated. This will be consumed
   * by [[sync]] to update entity pools accordingly, at which point all dirty entities
   * will be un-flagged.
   */
  protected readonly dirty: Entity[] = [];

  /** Contains entities that can be recycled. */
  protected readonly free: Entity[] = [];

  /** Creates a new entity and returns it. */
  public create(): Entity {
    // Attempt to recycle a previously destroyed entity which minimizes garbage collection
    // and small frame delays that could be caused by it.
    let entity = this.free.pop();

    if (entity) {
      return entity;
    }

    // If we can't recycle, we simply initialize this with the next index, which will
    // automatically set the version to 0.
    entity = this.entities.length;

    // If we are out of bits on the index part we can't create a new entity.
    if (entity > MAX_INDEX) {
      throw new Error('Maximum amount reached');
    }

    this.entities.push(entity);

    return entity;
  }

  /**
   * Returns the entity at the `index` position. This also includes destroyed entities.
   * Throws an error if no entity exists at that index.
   */
  public get(index: number): Entity {
    const entity = this.entities[ index ];

    // This hard check is required because the first entity will be "0", which would
    // cause the ! operator to produce a false positive here.
    if (entity === undefined) {
      throw new Error('Out of bounds.');
    }

    return entity;
  }

  /** Returns `true` if `entity` is not destroyed. */
  public alive(entity: Entity): boolean {
    // From the given entity we extract the index part and compare it with the entity
    // that is currently occupying that index. This will fail if their versions mis-
    // match, which means that the entity is no longer alive.
    return this.entities[ entity & MAX_INDEX ] === entity;
  }

  /** Destroys an `entity`. */
  public destroy(entity: Entity): this {
    if (this.alive(entity)) {
      const index = entity & MAX_INDEX;

      // Increment the version of the entity and mark the index as free so that it
      // can be recycled by the next entity that is created.
      this.free.push(
        this.entities[ index ] = (index | ((entity >> VERSION_BITS) + 1) << VERSION_BITS)
      );
    }

    return this;
  }

  /**
   * Returns the composition of an entity. If it didn't exist previously
   * it will be created instead.
   */
  public getComposition(entity: Entity): BitSet {
    let composition = this.compositions.get(entity);

    if (composition) {
      return composition;
    }

    composition = new BitSet();

    this.compositions.set(entity, composition);

    return composition;
  }

  protected foo = new Map();

  public composition(entity: Entity) {
    return this.foo.get(entity) ?? 0;
  }

  public addCompositionId(entity: Entity, id: number) {
    this.foo.set(entity, this.composition(entity) | id);
    this.setDirty(entity);
  }

  /**
   * Flags an alive `entity` as dirty, which means it will be checked if it can
   * be added or removed from entity groups during the next [[update]].
   */
  public setDirty(entity: Entity): void {
    if (this.alive(entity) && this.dirty.indexOf(entity) === -1) {
      this.dirty.push(entity);
    }
  }

  /**
   * Synchronizes dirty ({@link dirty}) entities with the given `groups`. Dirty
   * entities will be un-flagged in the process.
   */
  public sync(groups: readonly EntityGroup[]): void {
    const dirty = this.dirty;

    // Nothing to synchronize...
    if (!dirty.length) {
      return;
    }

    for (const group of groups) {
      for (const entity of dirty) {
        // If the entity is contained in the group and no longer eligible it will be
        // removed. If the entity is not contained but eligible it will be added to
        // the group.
        if (group.has(entity)) {
          if (! group.test(this.getComposition(entity))) {
            group.remove(entity);
          }
        }
        else if (group.test(this.getComposition(entity))) {
          group.add(entity);
        }
      }
    }

    this.dirty.length = 0;
  }

}
