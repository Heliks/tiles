import { Type } from '../../utils';
import { App } from '../app';
import { Task } from './task';
import { getTypeName } from './utils';


export class AddService implements Task {

  /**
   * @param value Class constructor or service instance.
   * @param instance Indicates if {@link value} is a service instance and doesn't need
   *  to be created by the service container.
   */
  constructor(public readonly value: Type | object, public readonly instance: boolean) {}

  public toString(): string {
    return 'Add Service: ' + getTypeName(this.value);
  }

  /** @inheritDoc */
  public exec(app: App): void {
    app.container.instance(
      this.instance
        ? this.value
        : app.container.make(this.value as Type)
    );
  }

}
