import { Type } from '@heliks/tiles-engine';
import { ScriptBehavior } from './script-behavior';


/** Stores known script types. */
export class ScriptDB extends Map<string, Type<ScriptBehavior>> {

  /**
   * Creates an instance of the script with the given `id`. Throws an error if no script
   * with this ID exists.
   */
  public create<T extends ScriptBehavior = ScriptBehavior>(id: string): T {
    const script = this.get(id) as Type<T>;

    if (! script) {
      throw new Error(`Unknown script ${id}`);
    }

    // eslint-disable-next-line new-cap
    return new script();
  }

}
