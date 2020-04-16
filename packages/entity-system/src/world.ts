import { BitSet } from './bit-set';
import { EntityGroup } from './entity-group';
import { EntityManager } from './entity-manager';
import { Filter } from './filter';
import { Storage } from './storage';
import { ClassType, Entity, Query } from './types';
import { EntityBuilder } from "./entity-builder";

export class World {

  /** {@link EntityManager} */
  public readonly entities = new EntityManager();

  /** Contains all registered entity groups. */
  protected readonly groups: EntityGroup[] = [];

  /**
   * Contains all registered component storages, mapped to the component which
   * they are storing.
   */
  protected readonly storages = new Map<ClassType, Storage>();

  /**
   * The index that is assigned to the next component storage with `register`.
   * Will be incremented automatically.
   */
  private nextStorageIndex = 0;

  /** {@inheritDoc} */
  public register<T>(component: ClassType<T>): Storage<T> {
    const storage = new Storage<T>(1 << this.nextStorageIndex++, component, this.entities);

    this.storages.set(component, storage);

    return storage;
  }

  /** {@inheritDoc} */
  public storage<T>(component: ClassType<T>): Storage<T> {
    const storage = this.storages.get(component) as Storage<T>;

    return storage ? storage : this.register(component);
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

  /** Returns `true` if `entity` is not destroyed. */
  public alive(entity: Entity): boolean {
    return this.entities.alive(entity);
  }

  /**
   * Creates an entity.
   *
   * @param components (optional) An array of components that are added to
   *  the entity automatically.
   * @returns The created entity.
   */
  public create(components?: ClassType[]): Entity {
    const entity = this.entities.create();

    if (components) {
      for (const component of components) {
        this.storage(component).add(entity);
      }
    }

    return entity;
  }

  /** Destroys an `entity`. */
  public destroy(entity: Entity): this {
    for (const storage of this.storages.values()) {
      storage.remove(entity);
    }

    this.entities.destroy(entity);

    return this;
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

    const items = this.entities.entities;
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

  /**
   * Returns a new entity builder that can be used to compose entities with
   * different components. The entity is created and added to the world
   * instantly.
   */
  public builder(): EntityBuilder {
    return new EntityBuilder(this.create(), this);
  }

}

