import { Container } from '@tiles/injector';
import { Ticker } from './ticker';
import { World } from './world';
import { SystemDispatcher } from '@tiles/entity-system';

export class Game {

  /**
   * The global service container. All modules and services will have
   * access to this.
   */
  public readonly container = new Container();

  /**
   * The entity world. This is also the main "API" with which other
   * systems will be working with.
   */
  public readonly world: World;

  /**
   * The ticker used to run the games update loop. Will only start
   * after the game is started.
   */
  public readonly ticker = new Ticker();

  public readonly dispatcher: SystemDispatcher;

  constructor() {
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
  }

  /**
   * Updates the engine and all of its sub-systems. This is the main game loop and is
   * called once on every frame.
   */
  protected update(): void {
    // Updates the world. E.g. entities, components.
    this.world.update();
  }

  /** Starts the game. */
  public start(): void {
    this.ticker.start();
  }

  /** Stops the game. */
  public stop(): void {
    this.ticker.stop();
  }

}
