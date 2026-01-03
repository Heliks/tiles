import { ScheduleId, System } from '@heliks/ecs';
import { TypeId } from '@heliks/ecs-serialize';
import { Container, InjectorToken, ValueFactory } from '@heliks/tiles-injector';
import { ComponentType, Preset, PresetId, World } from '../ecs';
import { Type, TypeLike } from '../utils';
import { App, AppSchedule } from './app';
import { Builder } from './builder';
import { Bundle } from './bundle';
import { ScheduleBuilder } from './schedule-builder';
import {
  AddBundle,
  AddComponent,
  AddFactory,
  AddPreset,
  AddService,
  AddSystem,
  AddType,
  AddValue,
  Task
} from './tasks';
import { Ticker } from './ticker';


/** Callback for {@link AppBuilder.run} tasks. */
export type BootCallback = (world: World) => void;


/**
 * Composes the {@link App game runtime}.
 *
 * The order in which things ({@link provide resources}, {@link system systems}, etc.)
 * are added is important. For example, if `SystemA` is added before `SystemB`, `SystemB`
 * will not be available to `SystemA`, since `SystemB` did not yet exist when `SystemA`
 * was added to the runtime.
 */
export class AppBuilder implements Builder {

  /** Contains the task queue. */
  public readonly tasks: Task[] = [];

  /**
   * Contains the user defined {@link Ticker}, if any.
   *
   * @internal
   */
  private _ticker?: Ticker;

  /**
   * @param container Service container used by the app. All providers, systems,
   *  etc. that are added to it via this builder, will be registered here.
   */
  constructor(public readonly container: Container = new Container()) {}

  /** @inheritDoc */
  public task(task: Task): this {
    this.tasks.push(task);

    return this;
  }

  /** Registers a `component`. */
  public component<C = unknown>(component: ComponentType<C>): this {
    this.tasks.push(new AddComponent(component));

    return this;
  }

  /**
   * Adds a {@link System} to the game.
   *
   * If the system is a type, it will be instantiated via the service container.
   *
   * The system will be executed according to the specified schedule. If no schedule
   * is provided, it will run in {@link AppSchedule.Update} by default.
   */
  public system(system: TypeLike<System>, schedule: ScheduleId = AppSchedule.Update): this {
    this.tasks.push(new AddSystem(system, schedule));

    return this;
  }

  /**
   * Adds a system schedule to the dispatcher.
   *
   * @example
   * ```ts
   *  enum Schedules {
   *    Physics = 'physics',
   *    Render = 'render'
   *  }
   *
   *  class PhysicsSystem implements System {
   *    // ...
   *  }
   *
   *  class RenderSystem implements System {
   *    // ...
   *  }
   *
   * runtime()
   *   .schedule(Schedules.Physics)
   *   .schedule(Schedules.Render)
   *   .system(PhysicsSystem, PHYSICS_SCHEDULE)
   *   .system(RenderSystem, RENDER_SCHEDULE);
   * ```
   */
  public schedule(schedule: ScheduleId): AppBuilder;

  /**
   * Returns a {@link ScheduleBuilder} that allows the insertion of a new system
   * schedule at a specified relative position.
   *
   * @example
   *  ```ts
   *  // Define custom schedule IDs
   *  enum CustomSchedule {
   *    A = 'a',
   *    B = 'b',
   *    C = 'c'
   *  }
   *
   *  // Configure multiple schedules with relative ordering
   *  runtime()
   *    .schedule().before(CustomSchedule.A, AppSchedule.Update)
   *    .schedule().after(CustomSchedule.B, CustomSchedule.A);
   *  ```
   */
  public schedule(): ScheduleBuilder<AppBuilder>;

  /** @internal */
  public schedule(schedule?: ScheduleId): ScheduleBuilder<AppBuilder> | AppBuilder {
    return schedule === undefined ? new ScheduleBuilder(this) : this;
  }

  /**
   * Registers a singleton on the service container.
   *
   * A singleton will call the given `factory` method once when the `token` is resolved
   * for the first time. Further injections of that token will re-use that result.
   */
  public singleton(token: InjectorToken, factory: ValueFactory<unknown, Container>): this {
    this.tasks.push(new AddFactory(token, true, factory));

    return this;
  }

  /**
   * Registers a factory on the service container.
   *
   * The service container will call the factory every time the given `token` is
   * being injected. Unlike {@link singleton}, the result will not be re-used.
   */
  public factory(token: InjectorToken, factory: ValueFactory<unknown, Container>): this {
    this.tasks.push(new AddFactory(token, false, factory));

    return this;
  }

  /**
   * Registers an entity {@link Preset preset} using the given {@link PresetId id}.
   *
   * The ID must be unique across all entity presets.
   */
  public preset(id: PresetId, preset: TypeLike<Preset>): this {
    this.tasks.push(new AddPreset(id, preset));

    return this;
  }

  /**
   * Creates a new instance of `type` and registers it on the service container, using
   * its own class type as the injector token.
   *
   * @example
   * ```ts
   *  class Foo {}
   *
   *  // Instantiate Foo and register it on the service container using its own class
   *  // type as the token.
   *  const app = runtime().provide(Foo).build();
   *
   *  // Retrieve a global instance of "Foo" from the service container.
   *  app.world.get(Foo);
   * ```
   */
  public provide(type: Type): this;

  /**
   * Binds the given `value` to `token` on the game's service container.
   *
   * @example
   * ```ts
   *  const app = new AppBuilder().provide('foo', 'bar').build();
   *  const msg = app.world.get('foo');
   *
   *  console.log(msg); // => "bar"
   * ```
   */
  public provide(token: InjectorToken, value: unknown): this;

  /** @internal */
  public provide(token: InjectorToken | Type, value?: unknown): this {
    this.tasks.push(
      value === undefined
        ? new AddService(token as Type, false)
        : new AddValue(token, value)
    );

    return this;
  }

  /**
   * Adds a type to the type store.
   *
   * The engine indexes objects using a type ID. This is usually assigned by using the
   * `@TypeId` decorator on a class declaration.
   *
   * @example
   * ```ts
   *  @TypeId('foo')
   *  class Foo {}
   *
   *  // => Type<Foo>
   *  const type = runtime()
   *    .type(Foo)
   *    .build()
   *    .world
   *    .get(TypeStore)
   *    .get('foo');
   * ```
   *
   * Alternatively, the type ID can be provided as a parameter to this task. This omits
   * the need for the `@TypeId` decorator.
   *
   * Typed objects are mainly used for {@link SerializeBundle serialization} and enable
   * the engine to serialize objects and fully restore their original typing from that
   * serialized data. Therefore, a type ID must be static and should never change between
   * application launches or be dynamic in any other way. Changing existing Type IDs on
   * live applications or during development will break backwards compatibility with
   * previously serialized data.
   *
   * @param type Type to add to the store.
   * @param id (optional) Static ID to assign to `type`. If `undefined`, the type ID
   *  will be resolved from the types' class metadata.
   */
  public type(type: Type, id?: TypeId): this {
    this.tasks.push(
      new AddType(type, id)
    );

    return this;
  }

  /**
   * Defines which {@link Ticker} should be used by the {@link App} to execute the game
   * loop. By default, the game will use the {@link FrameTicker}.
   *
   * Available tickers are:
   *  - {@link FrameTicker} - Uses the browsers' animation frame to tick the game. Most
   *    suited for actual games.
   *  - {@link IntervalTicker} - Ticks the game at a fixed interval. Most suited for
   *    servers and other node applications.
   */
  public ticker(ticker: Ticker): this {
    this._ticker = ticker;

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
    const app = new App(this.container, this._ticker);

    // Add app bindings to the service container.
    this.container
      .instance(app.dispatcher)
      .instance(app.state)
      .instance(app.types)
      .instance(app.world);

    this.container.bind(Ticker, app.ticker);

    this.exec(app);
    this.init(app.world);

    return app;
  }

}
