import { System } from '@heliks/ecs';
import { Game } from '../game';
import { ClassType } from '../types';
import { AddProvider, AddSystem, Task } from './tasks';
import { GameBuilder as Builder, Module } from './types';
import { Provider } from './provider';

/** Game builder. */
export class GameBuilder implements Builder {

  /**
   * Contains all tasks that this builder has queued. They will all be invoked
   * in the same order as they were added during `build()`.
   */
  protected readonly tasks: Task[] = [];

  /** @inheritDoc */
  public provide(provider: Provider): this {
    this.tasks.push(new AddProvider(provider));

    return this;
  }

  /** @inheritDoc */
  public system(system: ClassType<System>): this {
    this.tasks.push(new AddSystem(system));

    return this;
  }

  /**
   * Adds a `module` and immediately invokes the `build()` function to queue
   * additional tasks from inside the module.
   */
  public module(module: Module): this {
    // Modules will just add additional tasks to the task list,
    // so there is no reason to create an extra task for it.
    module.build(this);

    return this;
  }

  /** Builds the game. */
  public build(): Game {
    const game = new Game();

    for (const task of this.tasks) {
      try {
        task.exec(game);
      }
      catch (error) {
        // Error details.
        console.error(error);
        console.error('Task:', task);

        throw new Error('Task failed.');
      }
    }

    return game;
  }

}






