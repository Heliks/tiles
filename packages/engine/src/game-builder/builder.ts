import { Game } from '../game';
import { World } from '../ecs';


export interface Builder {

  /** Executes the builder on the given `game` instance. */
  exec(game: Game): void;

  /** Calls the onInit lifecycle on all registered tasks. */
  init(game: World): void;

}




