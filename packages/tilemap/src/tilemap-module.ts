import { GameBuilder, Module } from '@tiles/engine';
import { TilemapManager } from "./tilemap-manager";

export class TilemapModule implements Module {

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    builder.provide(TilemapManager);
  }

}
