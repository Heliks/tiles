import { SystemDispatcher } from '@heliks/ecs';
import { Container } from '@heliks/tiles-injector';
import { World } from '../ecs';
import { State, StateMachine } from './state';
import { Ticker } from './ticker';
import { TypeRegistry } from '../types';


/**
 * The game runtime. Everything related to run the game can be found here.
 *
 * The app uses a {@link StateMachine push down state machine} (PDA) that allows to
 * switch between game {@link State states}. This means that we need an initial state
 * to start the app. If no state is left in the state machine stack, the app is closed.
 *
 * ```ts
 * class MyState implements State<World> {
 *
 *    public update(): void {
 *      // Called once per frame.
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
    this.world      = new World(this.container);
    this.state      = new StateMachine(this.world);
    this.dispatcher = new SystemDispatcher(this.world);

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
    this.dispatcher.update();

    // Updates the world. E.g. entities, components.
    this.world.update();
    this.state.update();
  }

  /** Starts the app using the given `state`. */
  public start(state: State<World>): void {
    this.ticker.start();
    this.state.start(state);
  }

  /** Stops the app. */
  public stop(): void {
    this.ticker.stop();
  }

}
