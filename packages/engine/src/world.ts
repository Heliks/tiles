import 'reflect-metadata';
import { Container, ImmutableContainer, InjectorToken } from '@tiles/injector';
import { Storage, World as WorldBase } from '@tiles/entity-system';
import { ClassType } from './types';

export class World extends WorldBase implements ImmutableContainer {

  /**
   * @param container Service container for dependency injection (DI).
   */
  constructor(public readonly container: Container) {
    super();
  }

  /** {@inheritDoc} */
  public make<T = object>(target: ClassType<T>, params: unknown[] = [], bind = false): T {
    return this.container.make<T>(target, params, bind);
  }

  /** @inheritDoc */
  public get<T>(token: InjectorToken<T>): T {
    return this.container.get<T>(token);
  }

  /** Returns all initialized component storages. */
  public getStorages(): Storage<unknown>[] {
    return [
      ...this.storages.values()
    ];
  }

}
