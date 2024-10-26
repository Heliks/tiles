import { App } from './app';
import { World } from '../ecs';
import { Task } from './tasks';


export interface Builder {

  /** Executes the builder on the given `app` instance. */
  exec(app: App): void;

  /** Calls the onInit lifecycle on all registered tasks. */
  init(world: World): void;

  /** Adds a {@link Task task} to the app builder. */
  task(task: Task): this;

}




