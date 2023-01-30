import { Container } from '@heliks/tiles-injector';
import { ComponentType, World } from '../ecs';
import { App } from './app';
import { Bundle } from './bundle';
import { Provider } from './provider';
import { AddBundle, AddComponent, AddProvider, AddSystem, AddType, SystemProvider, Task } from './tasks';
import { Builder } from './builder';
import { Type } from '../utils';
import { TypeSerializationStrategy } from '../types';


/** Callback for {@link OnInit} lifecycle tasks. */
export type OnInitCallback = (world: World) => void;

/** Callback for {@link AppBuilder.run} tasks. */
export type BootCallback = (world: World) => void;

/**
 * Builder to create an {@link App}.
 *
 * The order in which builder tasks (e.g. adding providers, systems, etc.) are executed
 * is important. For example, if a system that is added before another system, it will
 * also be registered on the dispatcher first. Providers that use dependency injection
 * can only inject symbols that were provided before.
 *
 * @see Task
 */
export class AppBuilder implements Builder {

  /** Contains the task queue. */
  private readonly tasks: Task[] = [];

  /**
   * @param container Service container used by the app. All providers, systems,
   *  etc. that are added to it via this builder, will be registered here.
   */
  constructor(public readonly container: Container = new Container()) {}

  /**
   * Registers a `component`.
   *
   * This will automatically register the component type as a {@link type type}. You
   * can provide a custom serialization `strategy` if the default one is not sufficient.
   */
  public component<C = unknown>(component: ComponentType<C>, strategy?: TypeSerializationStrategy<C>): this {
    this.tasks.push(new AddComponent(component, strategy));

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
   * essentially are the modules of the engine. See: {@link Bundle}.
   */
  public bundle<B extends Bundle<AppBuilder>>(bundle: B): this {
    this.tasks.push(
      new AddBundle(bundle, new AppBuilder(this.container))
    );

    return this;
  }

  /** Adds a boot `callback` that is executed once during the build process. */
  public run(callback: BootCallback): this {
    this.tasks.push({
      exec: app => callback(app.world)
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

  /**
   * Registers a class {@link Type type} on the {@link TypeRegistry registry} so that
   * it can be serialized by the engine. The constructor name will be used as the ID
   * for the type.
   *
   * The default serialization strategy is able to handle most types, but it is possible
   * to provide a custom one where this is not the case.
   *
   * To get access to serialization APIs, the {@link SerializationBundle} can be added.
   */
  public type<T>(type: Type<T>, strategy?: TypeSerializationStrategy<T>): this {
    this.tasks.push(new AddType(type, strategy));

    return this;
  }

  /** @inheritDoc */
  public exec(app: App): void {
    for (const task of this.tasks) {
      try {
        task.exec(app);
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

  /** Builds the app. */
  public build(): App {
    const app = new App(this.container);

    this.exec(app);
    this.init(app.world);

    return app;
  }

}






