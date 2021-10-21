import { ComponentType, System } from '@heliks/ecs';
import { Game } from '../game';
import { ClassType } from '../types';
import { AddProvider, AddSystem, RegisterComponent, RegisterModule, Task } from './tasks';
import { GameBuilder as Builder, Module } from './types';
import { Provider } from './provider';
import { Container } from '@heliks/tiles-injector';

/** Game builder. */
export class GameBuilder implements Builder {

  /**
   * Contains all tasks that this builder has queued. They will all be invoked
   * in the same order as they were added.
   */
  protected readonly tasks: Task[] = [];

  /**
   * @param container (optional) Global service container to which game systems will
   *  be bound to.
   */
  constructor(private readonly container: Container = new Container()) {}

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
  public component(component: ComponentType): this {
    this.tasks.push(new RegisterComponent(component));

    return this;
  }

  /**
   * Adds a `module` and immediately invokes the `build()` function to queue
   * additional tasks from inside the module.
   */
  public module<M extends Module>(module: M): this {
    this.tasks.push(new RegisterModule(module, new GameBuilder(this.container)));

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

  /** @internal */
  private boot(game: Game): void {
    for (const task of this.tasks) {
      task.init?.(game.world);
    }
  }

  /** Builds the game. */
  public build(): Game {
    const game = new Game(this.container);

    this.exec(game);
    this.boot(game);

    return game;
  }

}






