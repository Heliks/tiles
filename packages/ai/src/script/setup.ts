import { Entity, World } from '@heliks/tiles-engine';
import { Script } from './script';
import { ScriptBehavior } from './script-behavior';


/**
 * Starts the execution of the given `script`.
 *
 * This will invoke the `stop()` callback on the currently running script and `start()`
 * on the script that starts execution.
 */
export function start(world: World, entity: Entity, component: Script, script: ScriptBehavior): void {
  component._running?.stop?.(world, entity);
  component._running = script;
  component._running.start?.(world, entity);
}

/**
 * Stops the execution of the currently running script.
 *
 * The {@link ScriptSystem} will restart the components script on the next frame. This
 * function should therefore be called *after* the component has been safely removed
 * from its owner.
 */
export function stop(world: World, entity: Entity, component: Script): void {
  if (component._running) {
    component._running.stop?.(world, entity);
    component._running = undefined;
  }
}
