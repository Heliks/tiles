import { SystemDispatcher } from '@heliks/ecs';
import { Container } from '@heliks/tiles-injector';
import { World } from '../ecs';
import { State, StateMachine } from './state';
import { Ticker } from './ticker';
import { TypeRegistry } from '../types';


/**
 * Default {@link SystemDispatcher dispatcher} schedules.
 *
 * Will always be added to the dispatcher when a new {@link App} is created.
 */
export enum AppSchedule {
  Update = 'app:update',
  PostUpdate = 'app:update'
}

/**
 * The game runtime. Everything related to run the game can be found here.
 *
 * The app uses a {@link StateMachine push down automation state machine} (PDA) that
 * allows to switch between game {@link State states}. This means that an initial state
 * is required to start the app. If no state is left in the state machine stack, the app
 * is closed. The current app state is updated after all systems in the apps system
 * dispatcher finished their update.
 *
 * ```ts
 * class MyState implements State<World> {
 *
 *    public update(): void {
 *      // Called once per frame after all app systems were updated.
 *    }
 *
 * }
 *
 * // Start the app using "MyState".
 * new App().start(new MyState());
 * ```
 */
export class App {

  /** Dispatches game systems. This essentially is the game loop logic. */
  public readonly dispatcher: SystemDispatcher;

  /** State machine that executes the game state. */
  public readonly state: StateMachine<World>;

  /** Ticker that executes the game loop. */
  public readonly ticker = new Ticker();

  /** Manages data types known to the application. */
  public readonly types = new TypeRegistry();

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
      .instance(this.state)
      .instance(this.ticker)
      .instance(this.types)
      .instance(this.world);
  }

  /**
   * Updates the app. Basically, this executes the game loop. While the app is running,
   * this is called automatically once per frame.
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
