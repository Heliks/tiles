import { Container } from '@heliks/tiles-injector';
import { ComponentType, System, World } from '../ecs';
import { Game } from './game';
import { ClassType } from '../types';
import { Bundle } from './bundle';
import { Provider } from './provider';
import { AddBundle, AddComponent, AddProvider, AddSystem, Task } from './tasks';
import { Builder as Builder } from './builder';


/** Callback for {@link OnInit} lifecycle tasks. */
export type OnInitCallback = (world: World) => void;

/** Callback for {@link GameBuilder.run} tasks. */
export type BootCallback = (game: Game) => void;

/**
 * Builder that is used to compose the game runtime.
 *
 * The order in which builder tasks (e.g. adding providers, systems, etc.) are executed
 * is important. For example, if a system that is added before another system, it will
 * also be registered on the dispatcher first. Providers that use dependency injection
 * can only inject symbols that were provided before.
 *
 * @see Task
 */
export class GameBuilder implements Builder {

  /** Contains the task queue. */
  private readonly tasks: Task[] = [];

  /**
   * @param container Service container that is used for the game runtime. All providers,
   *  systems, etc. will be registered here.
   */
  constructor(public readonly container: Container = new Container()) {}

  /**
   * Registers a `component`.
   *
   * Technically components don't have to be pre-registered. This additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  public component<C extends ComponentType>(component: C): this;

  /**
   * Registers a `component`. The component will be stored using the storage of `alias`.
   *
   * Technically components don't have to be pre-registered. This additionally binds
   * the storage that stores this component type on the service container. The storage
   * can then be injected using the `InjectStorage()` decorator.
   */
  public component<A extends ComponentType, C extends A>(component: C, alias: A): this;

  /** @internal */
  public component(component: ComponentType, alias?: ComponentType): this {
    this.tasks.push(new AddComponent(component, alias));

    return this;
  }

  /**
   * Adds a system to the dispatcher and registers it on the service container. If a type
   * is given instead, it will be instantiated with service container first.
   */
  public system(system: ClassType<System> | System): this {
    this.tasks.push(new AddSystem(system));

    return this;
  }

  /** Adds a `provider`. */
  public provide(provider: Provider): this {
    this.tasks.push(new AddProvider(provider));

    return this;
  }

  /** Adds a `bundle` to the game. */
  public bundle<B extends Bundle<GameBuilder>>(bundle: B): this {
    this.tasks.push(new AddBundle(bundle, new GameBuilder(this.container)));

    return this;
  }

  /** Adds a boot `callback` that is executed once during the build process. */
  public run(callback: BootCallback): this {
    this.tasks.push({
      exec: callback
    });

    return this;
  }

  /**
   * Adds a `callback` that will be called once when other {@link OnInit} lifecycle
   * events are executed during the build process.
   */
  public onInit(callback: OnInitCallback): this {
    this.tasks.push({
      exec: () => null,
      init: callback
    });

    return this;
  }

  /** @internal */
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






