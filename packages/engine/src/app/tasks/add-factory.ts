import { Container, InjectorToken, ValueFactory } from '@heliks/tiles-injector';
import { App } from '../app';
import { Task } from './task';


/** Provides a {@link ValueFactory factory} to the service container. */
export class AddFactory<T = unknown> implements Task {

  /**
   * @param token Token to which the factory should be bound.
   * @param singleton Determines if the factory is a singleton (called once) or a normal
   *  factory (called every time the binding is resolved).
   * @param factory The binding factory.
   */
  constructor(
    public readonly token: InjectorToken<T>,
    public readonly singleton: boolean,
    public readonly factory: ValueFactory<T, Container>
  ) {}

  /** @inheritDoc */
  public exec(app: App): void {
    this.singleton
      ? app.container.singleton(this.token, this.factory)
      : app.container.factory(this.token, this.factory);
  }

}
