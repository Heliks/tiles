import { ComponentType } from '@heliks/ecs';
import { App } from '../app';
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
  private registerComponentType(app: App): void {
    new AddType(this.component, this.strategy).exec(app);
  }

  /** @internal */
  private registerComponentStore(app: App): void {
    const store = app.world.register(this.component);
    const token = getStorageInjectorToken(this.component);

    app.container.bind(token, store);
  }

  /** @inheritDoc */
  public exec(app: App): void {
    this.registerComponentType(app);
    this.registerComponentStore(app);
  }

}
