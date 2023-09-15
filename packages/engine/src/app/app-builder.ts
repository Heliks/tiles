import { ScheduleId } from '@heliks/ecs';
import { Container, InjectorToken, ValueFactory } from '@heliks/tiles-injector';
import { ComponentType, World } from '../ecs';
import { TypeSerializationStrategy } from '../types';
import { Type } from '../utils';
import { App, AppSchedule } from './app';
import { Builder } from './builder';
import { Bundle } from './bundle';
import { ScheduleBuilder } from './schedule-builder';
import {
  AddBundle,
  AddComponent,
  AddFactory,
  AddService,
  AddSystem,
  AddType,
  AddValue,
  SystemProvider,
  Task
} from './tasks';


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
  private readonly tasks: Task[] = [];

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

  /**
   * Registers a `component`.
   *
   * This will automatically register the component type as a {@link type type}. A
   * custom {@link TypeSerializationStrategy serialization strategy} can be provided
   * if the default one is not sufficient
   */
  public component<C = unknown>(component: ComponentType<C>, strategy?: TypeSerializationStrategy<C>): this {
    this.tasks.push(new AddComponent(component, strategy));

    return this;
  }

  /**
   * Adds an ECS {@link SystemProvider system} to the dispatcher.
   *
   * The schedule to which the system will be added to can be specified via the given
   * schedule {@link ScheduleId id}. The system can either be an instance or a class
   * type. If it is the latter, the system will be instantiated using the service
   * container before it is added.
   */
  public system(system: SystemProvider, schedule: ScheduleId = AppSchedule.Update): this {
    this.tasks.push(new AddSystem(system, schedule));

    return this;
  }

  /**
   * Adds a system {@link ScheduleId schedule} to the dispatcher.
   *
   * ```ts
   *  const CUSTOM_SCHEDULE = Symbol();
   *
   *  class Foo implements System {
   *    // ...
   *  }
   *
   *  dispatcher
   *    .schedule(CUSTOM_SCHEDULE)      // Add the custom schedule
   *    .system(Foo, CUSTOM_SCHEDULE)   // Add system to custom schedule.
   * ```
   */
  public schedule(schedule: ScheduleId): AppBuilder;

  /**
   * Adds a system {@link ScheduleId schedule} to the dispatcher.
   *
   * The position where the new schedule should be inserted can be controlled with the
   * returned {@link ScheduleBuilder}.
   *
   * ```ts
   *  enum CustomSchedule {
   *    Foo,
   *    Bar
   *  }
   *
   *  // Add "CustomSchedule.Bar" schedule after `AppSchedule.Update`.
   *  dispatcher
   *    .schedule()
   *    .after(CustomSchedule.Bar, AppSchedule.Update);
   *
   *  // Add "CustomSchedule.Foo" schedule before `CustomSchedule.Bar`.
   *  dispatcher
   *    .schedule()
   *    .before(CustomSchedule.Foo, CustomSchedule.Bar);
   * ```
   */
  public schedule(): ScheduleBuilder<AppBuilder>;

  /** @internal */
  public schedule(schedule?: ScheduleId): ScheduleBuilder<AppBuilder> | AppBuilder {
    return schedule === undefined ? new ScheduleBuilder(this) : this;
  }

  /**
   * Registers a {@link ValueFactory singleton} on the game's service container.
   *
   * The singleton will be called when the service container attempts to resolve the
   * {@link InjectorToken token} to which it is bound to for the first time. The value
   * that it returns will be injected. Further attempts to resolve that token will inject
   * the same value that was returned on that first call.
   */
  public singleton(token: InjectorToken, factory: ValueFactory<unknown, Container>): this {
    this.tasks.push(new AddFactory(token, true, factory));

    return this;
  }

  /**
   * Registers a {@link ValueFactory factory} on the game's service container.
   *
   * The factory will be called every time when the service container attempts to
   * resolve the {@link InjectorToken token} to which they are bound to. The value
   * they return, is the value the container will inject.
   */
  public factory(token: InjectorToken, factory: ValueFactory<unknown, Container>): this {
    this.tasks.push(new AddFactory(token, false, factory));

    return this;
  }

  /**
   * Instantiates the given class type of a resource and registers it on the game's
   * service container.
   *
   * This can be used to create global services or data structs that can be accessed
   * by other systems or resources.
   *
   * ```ts
   *  class TimePassed {
   *    public ms = 0;
   *  }
   *
   *  class CountTime implements System {
   *    public update(world: World): void {
   *      world.get(TimePassed).ms += world.get(Ticker).delta;
   *    }
   *  }
   *
   *  const app = new AppBuilder().provide(TimePassed).system(CountTime).build();
   * ```
   */
  public provide(resource: Type): this;

  /**
   * Binds the given `value` to `token` on the game's service container.
   *
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






