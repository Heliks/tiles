import { GameBuilder, Module } from '@heliks/tiles-engine';
import { TilemapRenderer } from './tilemap-renderer';

export class TilemapModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.system(TilemapRenderer);
  }

}
