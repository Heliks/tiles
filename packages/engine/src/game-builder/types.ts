import { ComponentType, System } from '@heliks/ecs';
import { ClassType } from '../types';
import { Provider } from './provider';

export interface GameBuilder {
  provide(provider: Provider): this;
  system(system: ClassType<System>): this;

  /**
   * Registers a `component`.
   *
   * Technically components don't have to be pre-registered, it additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  component(component: ComponentType): this;
}

export interface Module {
  build(builder: GameBuilder): unknown;
}




