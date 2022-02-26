import { ComponentType, System } from '@heliks/ecs';
import { ClassType } from '../types';
import { Provider } from './provider';
import { Game } from '../game';
import { World } from '../ecs';


export interface GameBuilder {

  /**
   * Registers a `component`.
   *
   * Technically components don't have to be pre-registered. This additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  component<C extends ComponentType>(component: C): this;

  /**
   * Registers a `component`. The component will be stored using the storage of `alias`.
   *
   * Technically components don't have to be pre-registered. This additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  component<A extends ComponentType, C extends A>(component: C, alias: A): this;

  /**
   * Registers a `provider`.
   */
  provide(provider: Provider): this;

  /**
   * Registers a game system and adds it to the system dispatcher. If a system type
   * is given it will be created using the service container.
   *
   * Systems can implement lifecycle events.
   */
  system(system: ClassType<System> | System): this;

  /**
   * Executes the game builder on the given `game` instance. E.g. builds the game
   * using that instance.
   * @internal
   */
  exec(game: Game): void;

  /**
   * Calls the onInit lifecycle on all registered tasks.
   */
  init(game: World): void;

}




