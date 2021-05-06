import { Entity, World } from '@heliks/tiles-engine';
import { Script } from './script';

export enum ScriptState {
  /**
   * Script has finished running.
   */
  Done,
  /**
   * Script is still running. It will be executed on the next frame again
   */
  Running
}

/**
 * Executes the logic of a script. Every script uses the same instance of a script
 * runner hence why it is not recommended to add data related to the script state here.
 */
export interface ScriptRunner {

  /**
   * This is the logic implementation of a script. If a script is executed, this
   * function will be called once on each frame (for each script that is using this
   * runner) until it returns a `ScriptState.Done`.
   *
   * @param world Entity world
   * @param entity The entity to which the script belongs.
   * @param script The script instance that is being executed.
   */
  exec(world: World, entity: Entity, script: Script): ScriptState;

}

/**
 * Container for script runners.
 */
export class ScriptRunners extends Map<string, ScriptRunner> {}
