import { SystemDispatcher } from '@heliks/ecs';
import { Container } from '@heliks/tiles-injector';
import { World } from '../ecs';
import { State, StateMachine } from './state';
import { Ticker } from './ticker';
import { TypeRegistry } from '../types';


/**
 * Game runtime that is produced by a `GameBuilder`.
 *
 * Everything related to the game is stored and can be controlled via this instance.
 *
 * @see Builder
 */
export class Game {

  /** Responsible for dispatching game system. This is essentially the game loop. */
  public readonly dispatcher: SystemDispatcher;

  /** State machine that executes the game state. */
  public readonly state: StateMachine<World>;

  /** Ticker that executes the game loop. */
  public readonly ticker = new Ticker();

  /** Manages data types known to the application. */
  public readonly types = new TypeRegistry();

  /** World where entities exist. */
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
   * Updates all sub-systems of the game, e.g. systems, entities, game state. This is the
   * game loop and called once on each frame.
   */
  public update(): void {
    this.dispatcher.update();

    // Updates the world. E.g. entities, components.
    this.world.update();
    this.state.update();
  }

  /**
   * Starts the game using the given `state`.
   */
  public start(state: State<World>): void {
    this.ticker.start();
    this.state.start(state);
  }

  /** Stops the game. */
  public stop(): void {
    this.ticker.stop();
  }

}
