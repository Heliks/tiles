import { GameBuilder as Builder, Module, Provider } from './types';
import { ClassType } from '@tiles/common';
import { System } from '@tiles/entity-system';
import { Game } from '../game';
import { AddProvider, AddSystem, Task } from './tasks';

export class GameBuilder implements Builder {

  protected readonly tasks: Task[] = [];

  /** {@inheritDoc} */
  public provide(provider: Provider): this {
    this.tasks.push(new AddProvider(provider));

    return this;
  }

  /** {@inheritDoc} */
  public system(system: ClassType<System>): this {
    this.tasks.push(new AddSystem(system));

    return this;
  }

  public module(module: Module<GameBuilder>): this {
    // Modules will just add additional tasks to the task list,
    // so there is no reason to create an extra task for it.
    module.build(this);

    return this;
  }

  public build(): Game {
    const game = new Game();

    (<any>game.container).foo = '1';

    for (const task of this.tasks) {
      task.exec(game);
    }

    return game;
  }

}






