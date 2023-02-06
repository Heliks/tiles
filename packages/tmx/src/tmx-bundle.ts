import { AppBuilder, Bundle, ProcessingSystem, Query, QueryBuilder } from '@heliks/tiles-engine';
import { TmxTilemap } from './tmx-tilemap';
import { Transform } from 'pixi.js';


export class TmxSystem extends ProcessingSystem {

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder
      .contains(TmxTilemap)
      .contains(Transform)
      .build();
  }

  public update(): void {

  }

}


export class TmxBundle implements Bundle {

  /** @inheritDoc */
  public build(builder: AppBuilder): void {

  }

}
