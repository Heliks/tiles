import { ComponentType } from '@heliks/ecs';
import { Game } from '../game';
import { getStorageInjectorToken } from '../../ecs';
import { Task } from './task';
import { AddType } from './add-type';
import { TypeSerializationStrategy } from '../../types';


/** Adds a component to the game runtime. */
export class AddComponent<C> implements Task {

  /**
   * @param component Component type that should be registered.
   * @param strategy (optional) Custom serialization strategy.
   */
  constructor(
    private readonly component: ComponentType<C>,
    private readonly strategy?: TypeSerializationStrategy<C>
  ) {}

  /** @internal */
  private registerComponentType(game: Game): void {
    new AddType(this.component, this.strategy).exec(game);
  }

  /** @internal */
  private registerComponentStore(game: Game): void {
    const store = game.world.register(this.component);
    const token = getStorageInjectorToken(this.component);

    game.container.bind(token, store);
  }

  /** @inheritDoc */
  public exec(game: Game): void {
    this.registerComponentType(game);
    this.registerComponentStore(game);
  }

}
