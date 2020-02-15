import { Archetype } from './archetype';
import { BitSet } from './bit-set';
import { EntityManager } from './entity-manager';
import { EntityGroup } from './entity-group';
import { Filter } from './filter';
import { Storage, StorageManager } from './storage';
import { ClassType, Entity, Query } from './types';

export class World implements StorageManager {

  /** {@link EntityManager} */
  public readonly entities = new EntityManager();

  /**
   * Contains all registered component storages, mapped to the
   * component which they are storing.
   */
  protected readonly storages = new Map<ClassType, Storage>();

  /**
   * The index that is assigned to the next component storage with `register`.
   * Will be incremented automatically.
   */
  private nextStorageIndex = 0;

  /** Contains all registered entity groups. */
  protected readonly groups: EntityGroup[] = [];

  /** {@inheritDoc StorageManager.register()} */
  public register<T>(component: ClassType<T>): Storage<T> {
    const storage = new Storage<T>(1 << this.nextStorageIndex++, component, this.entities);

    this.storages.set(component, storage);

    return storage;
  }

  /** {@inheritDoc StorageManager.storage()} */
  public storage<T>(component: ClassType<T>): Storage<T> {
    const storage = this.storages.get(component) as Storage<T>;

    return storage
      ? storage
      : this.register(component);
  }

  public createComposition(components: ClassType[]): BitSet {
    const bits = new BitSet();

    for (const component of components) {
      bits.add(this.storage(component).id);
    }

    return bits;
  }

  public createFilter(query: Query): Filter {
    return new Filter(
      this.createComposition(query.contains || []),
      this.createComposition(query.excludes || [])
    );
  }

  /**
   * Creates an entity.
   *
   * @param components (optional) An array of components that are added to
   *  the entity automatically.
   * @returns The created entity.
   */
  public create(components?: ClassType[]): Entity {
    const entity = Symbol();

    if (components) {
      for (const component of components) {
        this.storage(component).add(entity);
      }
    }

    return entity;
  }

  /**
   * Returns an entity builder that can be used to build reoccurring entity
   * compositions (= "Archetype").
   */
  public archetype(): Archetype {
    return new Archetype(this);
  }

  /**
   * Inserts an entity into the world.
   *
   * @param entity The entity that should be inserted.
   * @param dirty (optional) If true the entity will also be marked as "dirty".
   */
  public insert(entity: Entity, dirty = true): void {
    this.entities.insert(entity);

    if (dirty) {
      this.entities.setDirty(entity);
    }
  }

  /** Updates the world. Should be called once on each frame. */
  public update(): void {
    this.entities.sync(this.groups);
  }

  /**
   * Queries all entities and returns an `EntityGroup` containing the result. The
   * entity group will be automatically kept in sync when `update()` is called.
   */
  public query(query: Query): EntityGroup {
    const filter = this.createFilter(query);

    // Look for cached version of the group.
    for (const group of this.groups) {
      if (group.filter.equals(filter)) {
        return group;
      }
    }

    const items = this.entities.getAlive();
    const group = new EntityGroup(filter);

    // Populate with entities that are eligible.
    for (const entity of items) {
      if (group.test(this.entities.getComposition(entity))) {
        group.add(entity);
      }
    }

    // Cache group so that it can be synchronized and re-used.
    this.groups.push(group);

    return group;
  }

  /** Returns all cached entity groups. */
  public getGroups(): readonly EntityGroup[] {
    return this.groups;
  }

}

