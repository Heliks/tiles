import { Container } from '@heliks/tiles-injector';
import { Ticker } from './ticker';
import { World } from './ecs';
import { SystemDispatcher } from '@heliks/ecs';


export class Game {

  /** @see Ticker */
  public readonly ticker = new Ticker();

  /** @see World */
  public readonly world: World;

  /** @see SystemDispatcher */
  public readonly dispatcher: SystemDispatcher;

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
  }

  /**
   * Updates the engine and all of its sub-systems. This is the main game loop and is
   * called once on every frame.
   */
  protected update(): void {
    this.dispatcher.update();

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
