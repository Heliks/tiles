import { ComponentType } from '@heliks/ecs';
import { Game } from '../game';
import { getStorageInjectorToken } from '../../ecs';
import { Task } from './task';


/**
 * Registers a component type and binds its component storage to the service
 * container.
 */
export class AddComponent<C extends ComponentType, A extends C = C> implements Task {

  /**
   * @param component Component type that should be registered.
   * @param alias (optional) If set to a component type that has a signature that is
   *  compatible with `component`, the `component` will be registered using the same
   *  storage as `alias`.
   */
  constructor(private readonly component: C, private readonly alias?: A) {}

  /** @inheritDoc */
  public exec(game: Game): void {
    const storage = this.alias
      ? game.world.registerAs(this.component, this.alias)
      : game.world.register(this.component);

    game.world.container.bind(getStorageInjectorToken(this.component), storage);
  }

}
