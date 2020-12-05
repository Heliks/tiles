import { GameBuilder, Module } from '@heliks/tiles-engine';
import { BehaviorManager } from './behavior-manager';
import { BehaviorSystem } from './behavior-system';

/** Module that provides basic AI scripting functionality. */
export class BehaviorModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder
      .provide(BehaviorManager)
      .system(BehaviorSystem);
  }

}
