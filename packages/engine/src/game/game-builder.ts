import { Container } from '@heliks/tiles-injector';
import { ComponentType, World } from '../ecs';
import { Game } from './game';
import { Bundle } from './bundle';
import { Provider } from './provider';
import { AddBundle, AddComponent, AddProvider, AddSystem, SystemProvider, Task } from './tasks';
import { Builder } from './builder';


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
   * @param container Service container used by the game runtime. All providers,
   *  systems, etc. that are added to it via this builder, will be registered here.
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

  /** Adds a system to the system dispatcher. */
  public system(system: SystemProvider): this {
    this.tasks.push(new AddSystem(system));

    return this;
  }

  /** Adds a `provider`. */
  public provide(provider: Provider): this {
    this.tasks.push(new AddProvider(provider));

    return this;
  }

  /**
   * Registers a `bundle`.
   *
   * Bundles are a collection of builder tasks grouped together as convenience. They
   * essentially are the modules of the game engine. See: {@link Bundle}.
   */
  public bundle<B extends Bundle<GameBuilder>>(bundle: B): this {
    this.tasks.push(
      new AddBundle(bundle, new GameBuilder(this.container))
    );

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
  public runOnInit(callback: OnInitCallback): this {
    this.tasks.push({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      exec: () => {},
      init: callback
    });

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

    // Register default resources.
    this.container
      .instance(game.ticker)
      .instance(game.world);

    this.exec(game);
    this.init(game.world);

    return game;
  }

}






