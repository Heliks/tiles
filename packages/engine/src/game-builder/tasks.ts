import { ClassType } from '../types';
import { System } from '@heliks/ecs';
import { Game } from '../game';
import { isFactoryProvider, isInstanceProvider, Provider } from './provider';
import { World } from '../ecs';

/**
 * A builder task. Will be executed when the `build()` method
 * is called on the builder.
 */
export interface Task {
  exec(game: Game): unknown;
}



/**
 * Registers systems. If the provided system is a system type it will be instantiated
 * by the engines service container first.
 */
export class AddSystem implements Task {

  /**
   * @param system Instance or type of a system.
   */
  constructor(protected readonly system: ClassType<System> | System) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    // Instantiate the system first using the service container if necessary.
    const system = typeof this.system === 'function' ? game.container.make(this.system) : this.system;

    game.container.instance(system);
    game.dispatcher.add(system);
  }

}

/** Task that registers a new [[Provider]] on the games service container. */
export class AddProvider implements Task {

  /**
   * @param provider The provider that should be added to the game. Will be treated
   *  differently depending on what kind of provider it is.
   */
  constructor(protected readonly provider: Provider) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    const container = game.container;
    const provider = this.provider;

    if (typeof provider === 'function') {
      container.make(provider, [], true);
    }
    else if (isInstanceProvider(provider)) {
      container.instance(provider);
    }
    else if (isFactoryProvider(provider)) {
      if (provider.singleton) {
        container.singleton(provider.token, provider.factory);
      }
      else {
        container.factory(provider.token, provider.factory);
      }
    }
    else {
      let value = provider.value;

      if (provider.instantiate) {
        value = container.make(provider.value as ClassType);
      }

      container.bind(provider.token, value);
    }
  }

}

/** */
export type BootScript = (world: World) => unknown;

export class AddBootScript implements Task {

  constructor(private readonly script: BootScript) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    this.script(game.world);
  }

}
