import 'reflect-metadata';

import { Container, ImmutableContainer, InjectorToken } from '@heliks/tiles-injector';
import { Entity, Storage, World as BaseWorld } from '@heliks/ecs';
import { Type } from '../utils';
import { EntityRef } from './entity-ref';
import { EntityBuilder } from './entity-builder';


/**
 * @see ImmutableContainer
 * @see World
 */
export class World extends BaseWorld implements ImmutableContainer {

  /**
   * @param container Service {@link Container container} that manages dependency
   *  injection for all providers, resources, etc.
   */
  constructor(public readonly container: Container) {
    super();
  }

  /** @inheritDoc */
  public make<T = object>(target: Type<T>, params: unknown[] = []): T {
    return this.container.make<T>(target, params);
  }

  /** @inheritDoc */
  public get<T>(token: InjectorToken<T>): T {
    return this.container.get<T>(token);
  }

  /** @inheritDoc */
  public has(token: InjectorToken): boolean {
    return this.container.has(token);
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

  /** @inheritDoc */
  public builder(): EntityBuilder {
    return new EntityBuilder(this.create(), this);
  }

}
