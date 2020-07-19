import { Changes } from './changes';
import { Entity, ENTITY_BITS, ENTITY_MASK } from './entity';

/**
 * Manages entities.
 */
export class EntityManager {

  /** Contains all existing entities, both living ones and destroyed ones. */
  public readonly entities: Entity[] = [];

  /** Contains entities that can be recycled. */
  private readonly free: Entity[] = [];

  /**
   * @param changes Change-set used to track entity modifications.
   */
  constructor(protected readonly changes = new Changes()) {}

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
    if (entity > ENTITY_MASK) {
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
    const entity = this.entities[index];

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
    return this.entities[entity & ENTITY_MASK] === entity;
  }

  /** Destroys an `entity`. */
  public destroy(entity: Entity): this {
    if (this.alive(entity)) {
      const index = entity & ENTITY_MASK;

      // Increment the version of the entity and mark the index as free so that it
      // can be recycled by the next entity that is created.
      this.free.push(
        this.entities[index] = (index | ((entity >> ENTITY_BITS) + 1) << ENTITY_BITS)
      );
    }

    return this;
  }

}
