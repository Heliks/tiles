import { BitSet } from './bit-set';
import { EntityGroup } from './entity-group';
import { EntityManager } from './entity-manager';
import { Filter } from './filter';
import { Storage } from './storage';
import { ClassType, Entity, Query } from './types';
import { EntityBuilder } from './entity-builder';
import { Changes } from './changes';

export class World {

  /** @inheritDoc Changes */
  public readonly changes = new Changes();

  /** @inheritDoc EntityManager */
  public readonly entities = new EntityManager(this.changes);

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

  /** @inheritDoc */
  public register<T>(component: ClassType<T>): Storage<T> {
    const storage = new Storage<T>(1 << this.nextStorageIndex++, component, this.changes);

    this.storages.set(component, storage);

    return storage;
  }

  /** @inheritDoc */
  public storage<T>(component: ClassType<T>): Storage<T> {
    const storage = this.storages.get(component) as Storage<T>;

    return storage ? storage : this.register(component);
  }

  /** @hidden */
  public createComposition(components: ClassType[]): BitSet {
    const bits = new BitSet();

    for (const component of components) {
      bits.add(this.storage(component).id);
    }

    return bits;
  }

  /** @hidden */
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
   * Creates an entity. If any `components` are given they will be automatically added
   * to it.
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

  /**
   * Destroys an `entity`. Components that belong to this entity will be removed lazily
   * during the worlds [[update()]].
   */
  public destroy(entity: Entity): this {
    if (this.entities.destroy(entity)) {
      this.changes.destroy(entity);
    }

    return this;
  }

  /**
   * Synchronizes changed entities with existing groups. This is called automatically
   * during the world [[update()]].
   */
  public sync(): void {
    const dirty = this.changes.changed;

    // Nothing to synchronize...
    if (dirty.length === 0) {
      return;
    }

    for (const group of this.groups) {
      for (const entity of dirty) {
        const composition = this.changes.composition(entity);

        // If the entity is contained in the group and no longer eligible it will be
        // removed. If the entity is not contained but eligible it will be added to
        // the group.
        if (group.has(entity)) {
          if (! group.test(composition)) {
            group.remove(entity);
          }
        }
        else if (group.test(composition)) {
          group.add(entity);
        }
      }
    }
  }

  /** Updates the world. Should be called once on each frame. */
  public update(): void {
    this.sync();

    for (const entity of this.changes.destroyed) {
      for (const storage of this.storages.values()) {
        storage.remove(entity);
      }
    }

    this.changes.clear();
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
      if (group.test(this.changes.composition(entity))) {
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

