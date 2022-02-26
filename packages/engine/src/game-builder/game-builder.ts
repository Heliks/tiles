import { Container } from '@heliks/tiles-injector';
import { ComponentType, System, World } from '../ecs';
import { Game } from '../game';
import { ClassType } from '../types';
import { Bundle } from './bundle';
import { Provider } from './provider';
import { AddBundle, AddComponent, AddProvider, AddSystem, Task } from './tasks';
import { GameBuilder as Builder } from './types';


/**
 * Builds the game runtime.
 *
 * The builder will execute all of its tasks in the same order as they were added.
 *
 * @see Game
 * @see Task
 */
export class GameBuilder implements Builder {

  /** Contains the task queue. */
  private readonly tasks: Task[] = [];

  /**
   * @param container Global service container.
   */
  constructor(public readonly container: Container = new Container()) {}

  /** @inheritDoc */
  public provide(provider: Provider): this {
    this.tasks.push(new AddProvider(provider));

    return this;
  }

  /** @inheritDoc */
  public system(system: ClassType<System> | System): this {
    this.tasks.push(new AddSystem(system));

    return this;
  }

  /** @inheritDoc */
  public component<C extends ComponentType>(component: C): this;

  /** @inheritDoc */
  public component<A extends ComponentType, C extends A>(component: C, alias: A): this;

  /** @internal */
  public component(component: ComponentType, alias?: ComponentType): this {
    this.tasks.push(new AddComponent(component, alias));

    return this;
  }

  /**
   * Adds the given `bundle` to the game.
   *
   * @see Bundle
   */
  public module<B extends Bundle>(bundle: B): this {
    this.tasks.push(new AddBundle(bundle, new GameBuilder(this.container)));

    return this;
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    for (const task of this.tasks) {
      try {
        task.exec(game);
      }
      catch (error) {
        console.error(`Failed to run task ${task}`);

        throw error;
      }
    }
  }

  /** @inheritDoc */
  public init(world: World): void {
    for (const task of this.tasks) {
      task.init?.(world);
    }
  }

  /** Builds the game. */
  public build(): Game {
    const game = new Game(this.container);

    this.exec(game);
    this.init(game.world);

    return game;
  }

}






