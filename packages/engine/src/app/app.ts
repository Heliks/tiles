import { SystemDispatcher } from '@heliks/ecs';
import { Container } from '@heliks/tiles-injector';
import { Presets, World } from '../ecs';
import { State, StateMachine } from './state';
import { Ticker } from './ticker';


/**
 * {@link SystemDispatcher System dispatcher} schedules used internally. These schedules
 * will always be present when a new {@link App game runtime} is created.
 */
export enum AppSchedule {

  /**
   * Normal update schedule where most game systems should run.
   *
   * If a system relies on data from other systems, the {@link PostUpdate} schedule or
   * a custom schedule should be used instead.
   */
  Update = 'app:update',

  /**
   * Runs after the {@link Update} schedule. System that rely on data from other systems
   * to have finished their computation should run here.
   */
  PostUpdate = 'app:update'

}

/**
 * Game runtime. Everything related to run the game can be found here.
 *
 * The runtime works with a {@link StateMachine push down automation state machine},
 * which means that an initial state is required to start the game. If no state is
 * left in the state machine, the runtime is stopped automatically.
 *
 * #### state.ts
 *
 * ```ts
 *  class MyState implements State<World> {
 *    public update(): void {
 *      console.log('Hello World');
 *    }
 *  }
 * ```
 *
 * #### index.ts
 *
 * ```ts
 *  import { MyState } from './state';
 *
 *  // Start the game runtime using `MyState`.
 *  new App().start(new MyState());
 * ```
 */
export class App {

  /** Dispatches game systems. This essentially is the game loop logic. */
  public readonly dispatcher: SystemDispatcher;

  /** Manages available entity {@link Preset presets}. */
  public readonly presets = new Presets();

  /** State machine that executes the game state. */
  public readonly state: StateMachine<World>;

  /** Ticker that executes the game loop. */
  public readonly ticker = new Ticker();

  /** Entity world. */
  public readonly world: World;

  /**
   * @param container Global service container. All modules and services will have
   *  access to this.
   */
  constructor(public readonly container: Container = new Container()) {
    this.world = new World(this.container);
    this.state = new StateMachine(this.world);

    this.dispatcher = new SystemDispatcher();
    this.dispatcher.add(AppSchedule.Update);
    this.dispatcher.add(AppSchedule.PostUpdate)

    // Register game loop on ticker.
    this.ticker.add(this.update.bind(this));

    // Add required bindings to service container.
    container
      .instance(this.dispatcher)
      .instance(this.presets)
      .instance(this.state)
      .instance(this.ticker)
      .instance(this.world);
  }

  /**
   * Updates the app. Basically, this executes the game loop.
   *
   * While the app is running, this is called automatically once per frame.
   */
  public update(): void {
    this.dispatcher.update(this.world);

    // Updates the world. E.g. entities, components.
    this.world.update();
    this.state.update();
  }

  /** Starts the app using the given `state`. */
  public start(state: State<World>): void {
    this.dispatcher.boot(this.world);

    this.ticker.start();
    this.state.start(state);
  }

  /** Stops the app. */
  public stop(): void {
    this.ticker.stop();
  }

}
