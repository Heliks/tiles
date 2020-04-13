import { ClassType, Entity, World } from './types';

export class EntityBuilder {

  constructor(
    protected readonly entity: Entity,
    protected readonly world: World
  ) {}

  /**
   * Adds an instance of `component` to the entity. If any `data` is given it
   * will be applied to the component after its instantiation.
   */
  public add<T>(component: ClassType<T>, data?: Partial<T>): this {
    this.world.storage(component).add(this.entity, data);

    return this;
  }

  /** Directly adds the given `component` instance to the entity. */
  public use<T extends Object>(component: T): this {
    this.world.storage(<ClassType>component.constructor).set(this.entity, component);

    return this;
  }

  /** Returns the entity.*/
  public build(): Entity {
    return this.entity;
  }

}
