import { SystemDispatcher } from '@heliks/ecs';
import { Container } from '@heliks/tiles-injector';
import { World } from './ecs';
import { StateMachine, StateStackState } from './state';
import { Ticker } from './ticker';


/**
 * Implementation of a game state.
 */
export type GameState = StateStackState<World>;


/**
 * Game runtime that is produced by a `GameBuilder`.
 *
 * Everything related to the game is stored and can be controlled via this instance.
 *
 * @see Builder
 */
export class Game {

  /** Ticker that executes the game loop. */
  public readonly ticker = new Ticker();

  /** @see World */
  public readonly world: World;

  /** @see SystemDispatcher */
  public readonly dispatcher: SystemDispatcher;

  /**
   * Contains the state machine that executes the game state.
   *
   * @see StateMachine
   */
  public readonly state: StateMachine<World>;

  /**
   * @param container Global service container. All modules and services will have
   *  access to this.
   */
  constructor(public readonly container: Container = new Container()) {
    // Initialize entity system.
    this.world = new World(this.container);
    this.dispatcher = new SystemDispatcher(this.world);

    // Add the update function to the game ticker.
    this.ticker.add(this.update.bind(this));

    // Add some system services to the global container so that modules
    // can access them.
    this.container.instance(
      this.ticker,
      this.world
    );

    this.state = new StateMachine(this.world);
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
  public start(state: GameState): void {
    this.ticker.start();
    this.state.start(state);
  }

  /** Stops the game. */
  public stop(): void {
    this.ticker.stop();
  }

}
