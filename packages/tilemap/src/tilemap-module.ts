import { GameBuilder, Module } from '@heliks/tiles-engine';
import { TilemapManager } from './tilemap-manager';

export class TilemapModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide(TilemapManager);
  }

}
