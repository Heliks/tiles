import { ClassType } from '../types';
import { Provider } from './types';
import { System } from '@tiles/entity-system';
import { Game } from '../game';

/**
 * A builder task. Will be executed when the `build()` method
 * is called on the builder.
 */
export interface Task {
  exec(game: Game): unknown;
}

/** Task that registers a new provider on the games service container. */
export class AddProvider implements Task {

  /**
   * @param provider The provider that should be added to the game. Will be treated
   *  differently depending on what kind of provider it is.
   */
  constructor(protected readonly provider: Provider) {}

  /** {@inheritDoc} */
  public exec(game: Game): void {
    const container = game.container;

    if (typeof this.provider === 'function') {
      // Class provider.
      container.make(this.provider, [], true);
    }
    else {
      // Value provider.
      container.bind(
        this.provider.token,
        this.provider.value
      );
    }
  }
}

/**
 * Task that instantiates and registers a game system on the
 * system dispatcher.
 */
export class AddSystem implements Task {

  /**
   * @param system The constructor of a game system.
   */
  constructor(protected readonly system: ClassType<System>) {}

  /** {@inheritDoc} */
  public exec(game: Game): void {
    const system = game.container.make(this.system);

    game.container.instance(system);
    game.dispatcher.add(system);
  }

}
