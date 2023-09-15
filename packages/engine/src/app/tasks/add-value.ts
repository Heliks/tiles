import { InjectorToken } from '@heliks/tiles-injector';
import { App } from '../app';
import { Task } from './task';


/** Binds a value to the service container. */
export class AddValue implements Task {

  /**
   * @param token Token used to bind {@link value}.
   * @param value Value that should be bound to {@link token}.
   */
  constructor(public readonly token: InjectorToken, public readonly value: unknown) {}

  /** @inheritDoc */
  public exec(app: App): void {
    app.container.bind(this.token, this.value)
  }

}