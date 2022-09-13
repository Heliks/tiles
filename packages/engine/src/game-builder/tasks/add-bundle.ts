import { Builder } from '../builder';
import { Bundle } from '../bundle';
import { Game } from '../../game';
import { World } from '../../ecs';
import { hasOnInit } from '../lifecycle';
import { Task } from './task';


/**
 * Task that adds a bundle of systems, services etc. to the game.
 *
 * @see Bundle
 */
export class AddBundle<B extends Builder> implements Task {

  /**
   * @param bundle Instance of the bundle that should be added to the game.
   * @param builder An instance of the game builder. Should be separate from the game
   *  builder that registers this task.
   */
  constructor(private readonly bundle: Bundle<B>, private readonly builder: B) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    this.bundle.build(this.builder);
    this.builder.exec(game);
  }

  /** @inheritDoc */
  public init(world: World): void {
    this.builder.init(world);

    if (hasOnInit(this.bundle)) {
      this.bundle.onInit(world);
    }
  }

  /** @internal */
  public toString(): string {
    return `AddBundle:${this.bundle.constructor.name}`;
  }

}
