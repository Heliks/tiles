import { ComponentType, System } from '@heliks/ecs';
import { ClassType } from '../types';
import { Provider } from './provider';
import { Game } from '../game';


export interface GameBuilder {

  /**
   * Registers a `component`.
   *
   * Technically components don't have to be pre-registered. This additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  component(component: ComponentType): this;

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

}

/**
 * A module that bundles multiple systems or providers together.
 *
 * Modules can implement lifecycle events.
 */
export interface Module {
  build(builder: GameBuilder): unknown;
}




