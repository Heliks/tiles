import { Container } from '@tiles/injector';
import { Ticker } from './ticker';
import { World } from './world';
import { ModuleFactory } from './module';

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

  /** Creates and caches modules. */
  public readonly modules = new ModuleFactory();

  constructor() {
    this.world = new World(this.container);

    // Add the update function to the game ticker.
    this.ticker.add(this.update.bind(this));

    // Add some system servies to the service container.
    this.container.instance(
      this.modules,
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
