import { ClassType, ComponentEvent, ComponentEventType, Entity, Storage as Base } from './types';
import { EventQueue } from '@heliks/event-queue';
import { Changes } from './changes';

export class Storage<T = unknown> implements Base<T> {

  /** The event queue to which this storage will push events. */
  protected readonly _events = new EventQueue<ComponentEvent>();

  /** Contains all component instances mapped to the entity to which they belong. */
  protected readonly components = new Map<Entity, T>();

  /**
   * @param id The id of the storage.
   * @param type The component type that this storage is storing.
   * @param changes Change-set that keeps track of entity changes.
   */
  constructor(
    public readonly id: number,
    public readonly type: ClassType<T>,
    public readonly changes: Changes
  ) {}

  /** @inheritDoc */
  public add(entity: Entity, data?: Partial<T>): T {
    // eslint-disable-next-line new-cap
    const component = new this.type();

    if (data) {
      Object.assign(component, data);
    }

    this.components.set(entity, component);
    this.changes.add(entity, this.id);

    this._events.push({
      entity, type: ComponentEventType.Added
    });

    return component;
  }

  /** @inheritDoc */
  public set(entity: Entity, instance: T): void {
    this.components.set(entity, instance);
    this.changes.add(entity, this.id);

    this._events.push({
      entity, type: ComponentEventType.Added
    });
  }

  /** @inheritDoc */
  public get(entity: Entity): T {
    const component = this.components.get(entity) as T;

    if (! component) {
      throw new Error('No component found for entity.');
    }

    return component;
  }

  /** {@inheritDoc} */
  public remove(entity: Entity): boolean {
    if (this.components.has(entity)) {
      this.components.delete(entity);
      this.changes.remove(entity, this.id);

      this._events.push({
        entity, type: ComponentEventType.Removed
      });

      return true;
    }

    return false;
  }

  /** @inheritDoc */
  public has(entity: Entity): boolean {
    return this.components.has(entity);
  }

  /** @inheritDoc */
  public drop(): void {
    for (const entity of [...this.components.keys()]) {
      this.changes.remove(entity, this.id);
    }

    this.components.clear();
  }

  /** @inheritDoc */
  public events(): EventQueue<ComponentEvent> {
    return this._events;
  }

}
