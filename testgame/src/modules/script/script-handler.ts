import { contains, Injectable, ProcessingSystem, Ticker, World } from '@heliks/tiles-engine';
import { ScriptRunners, ScriptState } from './script-runners';
import { Script } from './script';

/**
 * System that runs scripts. Scripts must be registered on the `ScriptRunners` resource
 * before they can be executed.
 */
@Injectable()
export class ScriptHandler extends ProcessingSystem {

  /**
   * @param scripts {@see ScriptRunners}
   * @param ticker {@see Ticker}
   */
  constructor(private readonly scripts: ScriptRunners, private readonly ticker: Ticker) {
    super(contains(Script));
  }

  /** @inheritDoc */
  public update(world: World): void {
    const scripts = world.storage(Script);

    for (const entity of this.group.entities) {
      const script = scripts.get(entity);

      if (script.cooldown > 0) {
        script.cooldown -= this.ticker.delta;

        // Skip script if its on cooldown.
        continue;
      }

      if (script._run) {
        const executable = this.scripts.get(script.name);

        if (executable) {
          script.isRunning = executable.exec(world, entity, script) === ScriptState.Done;
        }
        else {
          console.warn(`Missing script "${script.name}"`);
        }

        // Remove flag so script can be executed again.
        script._run = false;
      }
    }
  }

}
