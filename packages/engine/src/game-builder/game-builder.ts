import { ComponentType, System, World } from '../ecs';
import { Game } from '../game';
import { ClassType } from '../types';
import { AddComponent, AddModule, AddProvider, AddSystem, Task } from './tasks';
import { GameBuilder as Builder, Module } from './types';
import { Provider } from './provider';
import { Container } from '@heliks/tiles-injector';


/**
 * Builder responsible for building the game runtime.
 *
 * The builder will initialize all dependencies (services, systems etc.) in the same
 * order as they were added. Meaning that if `ServiceA` is added before `ServiceB`,
 * only `ServiceB` can access `ServiceA`, but not the other way around. On the same
 * note a game system `SystemA` will always run before `SystemB`, if `SystemA` was
 * added to the builder first.
 *
 * @see Game
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
  public component<C extends ComponentType, A extends C>(component: C, alias?: A): this {
    this.tasks.push(new AddComponent(component, alias));

    return this;
  }

  /**
   * Adds a `module` and immediately invokes the `build()` function to queue
   * additional tasks from inside the module.
   */
  public module<M extends Module>(module: M): this {
    this.tasks.push(new AddModule(module, new GameBuilder(this.container)));

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






