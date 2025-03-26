import { AppBuilder, Bundle, getTypeId, Type } from '@heliks/tiles-engine';
import { Script } from './script';
import { ScriptBehavior } from './script-behavior';
import { ScriptDB } from './script-db';
import { ScriptSystem } from './script-system';


/**
 * Bundle that provides functionality to execute scripts on entities.
 *
 * @see Script
 */
export class ScriptBundle implements Bundle {

  /** @internal */
  private readonly db = new ScriptDB();

  /**
   * Adds one or more {@link ScriptBehavior scripts} to the {@link ScriptDB}, using
   * their type ID as script ID.
   */
  public script(...scripts: Type<ScriptBehavior>[]): this {
    for (const script of scripts) {
      this.db.set(getTypeId(script), script);
    }

    return this;
  }

  /** @inheritDoc */
  public build(builder: AppBuilder): void {
    builder
      .component(Script)
      .provide(ScriptDB, this.db)
      .system(ScriptSystem);
  }

}
