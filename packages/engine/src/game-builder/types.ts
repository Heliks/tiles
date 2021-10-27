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
   *
   * If `alias` is set to a component type that has a signature that is compatible with
   * the type of `component`, the `component` will be registered using the same storage
   * as `alias`.
   */
  component<C extends ComponentType, A extends C>(component: C, alias?: A): this;

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

/**
 * A module that bundles multiple systems or providers together.
 *
 * Modules can implement lifecycle events.
 */
export interface Module {
  build(builder: GameBuilder): unknown;
}




