import { ClassType, Entity } from './types';
import { StorageManager } from './storage';

export class EntityBuilder {

  /** The entity that this builder is composing. */
  protected readonly entity: Entity = Symbol();

  /** Indicates if ``build()`` was already called on this builder. */
  protected isBuilt = false;

  /** World in which this builder was created. */
  constructor(protected world: StorageManager) {}

  /**
   * Adds a component to the entity.
   *
   * @param component The component to add.
   * @param data (optional) Data that should be assigned to the component.
   * @returns this
   */
  public add<T>(component: ClassType<T>, data?: Partial<T>): this {
    this.world.storage(component).add(this.entity, data);

    return this;
  }

  /** {@inheritDoc Builder.build()} */
  public build(): Entity {
    if (this.isBuilt) {
      throw new Error('Entity is already built');
    }

    this.isBuilt = true;

    return this.entity;
  }

}
