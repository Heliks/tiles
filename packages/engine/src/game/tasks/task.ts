import { World } from '../../ecs';
import { Game } from '../game';


/**
 * Internally used by the `GameBuilder` to store meta-data about build tasks (e.g. adding
 * a system, registering a provider, etc.).
 */
export interface Task {

  /**
   * Executes the task.
   *
   * This is where the logic of each build step is implemented. After executing this,
   * the tasks is considered complete and the builder will move on to the next one.
   */
  exec(game: Game): unknown;

  /**
   * Runs initialization logic.
   *
   * If implemented, this will be called after *all* builder tasks were successfully
   * executed. Additional initialization logic, like calling the `OnInit` lifecycle,
   * can be implemented here.
   */
  init?(world: World): unknown;

}








