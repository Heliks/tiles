import { AppBuilder, Bundle } from '@heliks/tiles-engine';
import { Script } from './script';
import { ScriptSystem } from './script-system';


/**
 * Bundle that provides functionality to execute scripts on entities.
 *
 * @see Script
 */
export class ScriptBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder.type(Script).system(ScriptSystem);
  }

}
