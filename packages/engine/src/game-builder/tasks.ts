import { ClassType } from '../types';
import { System } from '@tiles/entity-system';
import { Game } from '../game';
import { isFactoryProvider, Provider } from "./provider";

/**
 * A builder task. Will be executed when the `build()` method
 * is called on the builder.
 */
export interface Task {
  exec(game: Game): unknown;
}


/** Task that instantiates and registers a game system on the system dispatcher. */
export class AddSystem implements Task {

  /**
   * @param system The constructor of a game system.
   */
  constructor(protected readonly system: ClassType<System>) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    const system = game.container.make(this.system);

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

    // Class provider.
    if (typeof provider === 'function') {
      container.make(provider, [], true);
    }
    // Factory provider.
    else if (isFactoryProvider(provider)) {
      // If the singleton flag is set it will also be bound to the service
      // container as such.
      provider.singleton
        ? container.singleton(provider.token, provider.factory)
        : container.factory(provider.token, provider.factory);
    }
    // Value provider.
    else {
      container.bind(provider.token, provider.value);
    }
  }

}

