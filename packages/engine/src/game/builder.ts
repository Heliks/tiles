import { App } from './app';
import { World } from '../ecs';


export interface Builder {

  /** Executes the builder on the given `app` instance. */
  exec(app: App): void;

  /** Calls the onInit lifecycle on all registered tasks. */
  init(world: World): void;

}




