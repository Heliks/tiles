import { BaseWorld } from './base-world';
import { ClassType, Entity } from './types';
import { StorageManager } from './storage';

export class EntityBuilder {

  constructor(
    protected readonly entity: Entity,
    protected readonly world: BaseWorld
  ) {}

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

  public use<T>(component: object): this {
    this.world.storage(<ClassType>component.constructor).set(this.entity, component);

    return this;
  }

  /** {@inheritDoc Builder.build()} */
  public build(): Entity {
    return this.entity;
  }

}
