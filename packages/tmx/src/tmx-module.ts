import { GameBuilder, Module } from '@heliks/tiles-engine';
import { GameMapHandler } from './game-map-handler';

/**
 * Module for loading and handling TMX maps.
 */
export class TmxModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide(GameMapHandler);
  }

}
