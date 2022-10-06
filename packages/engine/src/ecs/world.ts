import 'reflect-metadata';
import { Container, ImmutableContainer, InjectorToken } from '@heliks/tiles-injector';
import { Entity, Storage, World as WorldBase } from '@heliks/ecs';
import { ClassType, Type } from '../types';
import { EntityRef } from './entity-ref';

export class World extends WorldBase implements ImmutableContainer {

  /**
   * @param container Service container for dependency injection (DI).
   */
  constructor(public readonly container: Container) {
    super();
  }

  /** @inheritDoc */
  public make<T = object>(target: ClassType<T>, params: unknown[] = [], bind = false): T {
    return this.container.make<T>(target, params, bind);
  }

  /** @inheritDoc */
  public get<T>(token: InjectorToken<T>): T {
    return this.container.get<T>(token);
  }

  /**
   * Adds a component to an entity.
   * Todo: Move this to ECS package.
   */
  public add(entity: Entity, component: object): this {
    this.storage(component.constructor as Type<unknown>).set(entity, component);

    return this;
  }

  /** Returns all initialized component storages. */
  public getStorages(): Storage<unknown>[] {
    return [
      ...this.storages.values()
    ];
  }

  /** Returns a reference to the given `entity`. */
  public reference<C = unknown>(entity: Entity): EntityRef {
    return new EntityRef<C>(this, entity);
  }

}
