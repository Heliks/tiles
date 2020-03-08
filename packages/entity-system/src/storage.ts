import { EntityManager } from './entity-manager';
import { ClassType, Entity } from './types';

export class Storage<T = unknown> {

  /** Contains all component instances mapped to the entity to which they belong. */
  protected components = new Map<Entity, T>();

  /**
   * @param id The id of the storage.
   * @param type The component type that this storage is storing.
   * @param entityMgr Entity manager.
   */
  constructor(
    public readonly id: number,
    public readonly type: ClassType<T>,
    protected readonly entityMgr: EntityManager
  ) {}

  /**
   * Adds a component for the given entity.
   *
   * @param entity An entity.
   * @param data (optional) Initial data that should be set on the component.
   * @returns The newly created component.
   */
  public add(entity: Entity, data?: Partial<T>): T {
    // eslint-disable-next-line new-cap
    const component = new this.type();

    if (data) {
      Object.assign(component, data);
    }

    this.components.set(entity, component);

    this.entityMgr.getComposition(entity).add(this.id);
    this.entityMgr.setDirty(entity);

    return component;
  }

  /**
   * Directly assigns an instance of the stored component to the given entity.
   *
   * @param entity An entity.
   * @param instance Component instance.
   */
  public set(entity: Entity, instance: T): void {
    this.components.set(entity, instance);

    this.entityMgr.getComposition(entity).add(this.id);
    this.entityMgr.setDirty(entity);
  }

  /** Returns true if a component is stored for the given entity. */
  public get(entity: Entity): T {
    const component = this.components.get(entity) as T;

    if (! component) {
      throw new Error('No component found for entity.');
    }

    return component;
  }

  /**
   * Removes the component of the given entity from the storage. Returns true if a
   * component was removed.
   */
  public remove(entity: Entity): boolean {
    if (this.components.has(entity)) {
      this.components.delete(entity);

      this.entityMgr.getComposition(entity).remove(this.id);
      this.entityMgr.setDirty(entity);

      return true;
    }

    return false;
  }

  /** Returns true if a component is stored for the given entity. */
  public has(entity: Entity): boolean {
    return this.components.has(entity);
  }

  /**
   * Drops the complete storage. All entities that stored a component
   * here will be marked as "dirty" and their composition updated
   * accordingly.
   */
  public drop(): void {
    for (const entity of Array.from(this.components.keys())) {
      this.entityMgr.getComposition(entity).remove(this.id);
      this.entityMgr.setDirty(entity);
    }

    this.components.clear();
  }

}

/**
 * Manages component storages.
 */
export interface StorageManager {
  /** Registers a component storage.. */
  register<T>(component: ClassType<T>): Storage<T>;
  /** Returns the storage of the given component. */
  storage<T>(component: ClassType<T>): Storage<T>;
}

