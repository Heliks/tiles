import { ComponentType } from '@heliks/ecs';
import { getStorageInjectorToken } from '../../ecs';
import { App } from '../app';
import { Task } from './task';


/** Adds a component to the game runtime. */
export class AddComponent<C> implements Task {

  /**
   * @param component Component type that should be registered.
   */
  constructor(private readonly component: ComponentType<C>) {}

  /** @inheritDoc */
  public exec(app: App): void {
    const store = app.world.register(this.component);
    const token = getStorageInjectorToken(this.component);

    app.container.bind(token, store);
  }

}
