import 'reflect-metadata';

import { Entity, Storage, World as BaseWorld } from '@heliks/ecs';
import { Container, ImmutableContainer, InjectorToken } from '@heliks/tiles-injector';
import { getType, getTypeName, isType, Type, TypeLike } from '../utils';
import { EntityBuilder } from './entity-builder';
import { EntityRef } from './entity-ref';
import { hasOnInit } from './lifecycle';


/**
 * ## Entities & Components
 *
 * Entities store components. Entities are 32-bit integers that consists of the index
 * and the generation (version). Components are class {@link Type types}. Each entity
 * can store one instance of each unique component type.
 *
 * ```ts
 *  // Creates an entity without any components.
 *  world.insert();
 *
 *  // Creates an entity and attaches "Foo" as a component.
 *  world.insert(class Foo {});
 * ```
 *
 * ## Resources
 *
 * Resources are a global instance of a {@link Type} that can be accessed through the
 * world. Resources can be accessed from anywhere, which makes them suitable for storing
 * data that is truly global. They can also be injected into other resources or systems
 * via the service container.
 *
 * There can only be one resource of a given type at the same time. If more than one is
 * needed, entities and components are the better candidate.
 *
 * ```ts
 *  class Foo {}
 *
 *  // Initializes "foo" using the service container and adds it to the world.
 *  world.add(Foo);
 *
 *  // Retrieve the resource from the world.
 *  world.get(Foo);
 * ```
 *
 * @see ImmutableContainer
 * @see World
 */
export class World extends BaseWorld implements ImmutableContainer {

  /**
   * Keeps track of types that are bound to the service container as resource. Unlike
   * other symbols bound to the service container, resources can be added or removed
   * at runtime.
   *
   * @internal
   */
  private readonly resources = new Set<Type>();

  /**
   * @param container Service {@link Container} that manages available dependencies
   *  for this entity world.
   */
  constructor(public readonly container: Container) {
    super();
  }

  /** @inheritDoc */
  public create(): EntityBuilder {
    return new EntityBuilder(this, this.insert());
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
   * Adds a resource to the world. There can only be one instance of a given resource
   * type at the same time. Throws when a resource type already exists.
   */
  public add<T extends object>(resource: TypeLike<T>): this {
    const type = getType(resource);
    const value = isType(resource) ? this.container.make(resource) : resource;

    if (this.resources.has(type)) {
      throw new Error(`A resource of type ${getTypeName(type)} already exists`);
    }

    this.container.bind(type, value);
    this.resources.add(type);

    if (hasOnInit(value)) {
      value.onInit(this);
    }

    return this;
  }

  /**
   * Removes the given resource type. Throws an error if the given type is not a resource
   * known to the world.
   */
  public remove<T extends object>(resource: Type<T>): this {
    // Only remove type from service container if it is really a resource.
    if (! this.resources.has(resource)) {
      throw new Error(`Type ${getTypeName(resource)} is not a resource.`);
    }

    this.container.unbind(resource);
    this.resources.delete(resource);

    return this;
  }

  /**
   * Adds a component to an entity.
   * Todo: Move this to ECS package.
   */
  public attach(entity: Entity, component: object): this {
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
