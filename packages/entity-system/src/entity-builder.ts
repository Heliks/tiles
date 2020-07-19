import { ClassType, World } from './types';
import { Entity } from './entity';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public use<T extends Record<string, any>>(component: T): this {
    this.world.storage(component.constructor as ClassType).set(this.entity, component);

    return this;
  }

  /** Returns the entity.*/
  public build(): Entity {
    return this.entity;
  }

}
