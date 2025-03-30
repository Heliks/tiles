import { TypeId } from '@heliks/ecs-serialize';
import { Type } from '../../utils';
import { App } from '../app';
import { Task } from './task';


/** Adds a type to the type store. */
export class AddType implements Task {

  /**
   * @param type The type to store.
   * @param id Id used to store the type. If not set, this will be resolved from the
   *  types class metadata.
   */
  constructor(public readonly type: Type, public readonly id?: TypeId) {}

  /** @inheritDoc */
  public exec(app: App): void {
    if (this.id) {
      app.types.set(this.type, this.id)
    }
    else {
      app.types.add(this.type);
    }
  }

}
