import { World } from '../../ecs';
import { App } from '../app';


/** Implementation of a build task internally used by the {@link AppBuilder}. */
export interface Task {

  /**
   * Executes the task.
   *
   * This is where the logic of each build step is implemented. After executing this,
   * the tasks is considered complete and the builder will move on to the next one.
   */
  exec(app: App): void;

  /**
   * Runs initialization logic.
   *
   * If implemented, this will be called after *all* builder tasks were successfully
   * executed. Additional initialization logic, like calling the `OnInit` lifecycle,
   * can be implemented here.
   */
  init?(world: World): void;

}








