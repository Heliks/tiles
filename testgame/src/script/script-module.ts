import { GameBuilder, Module } from '@heliks/tiles-engine';
import { ScriptRunners } from './script-runners';
import { ScriptHandler } from './script-handler';

export class ScriptModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(ScriptRunners)
      .system(ScriptHandler);
  }

}
