import { ClassType } from '../types';
import { System } from '@heliks/ecs';
import { Game } from '../game';
import { isFactoryProvider, Provider } from './provider';

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

    // Class provider.
    if (typeof this.provider === 'function') {
      container.make(this.provider, [], true);
    }
    // Factory provider.
    else if (isFactoryProvider(this.provider)) {
      // If the singleton flag is set it will also be bound to the service
      // container as such.
      this.provider.singleton
        ? container.singleton(this.provider.token, this.provider.factory)
        : container.factory(this.provider.token, this.provider.factory);
    }
    // Value provider.
    else {
      container.bind(this.provider.token, this.provider.value);
    }
  }

}

