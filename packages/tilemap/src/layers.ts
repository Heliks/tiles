import { Grid, Vec2 } from '@heliks/tiles-engine';
import { MapObject } from './map-object';

export enum LayerType {
  Tiles,
  Objects
}

/** @internal */
type Tile = {
  id: number;
  index: number;
};

/** A layer that contains tiles structured in a grid. */
export class TileLayer {

  constructor(public readonly data: number[]) {}

  /***/
  public *iter(): IterableIterator<Tile> {
    for (let index = 0, l = this.data.length; index < l; index++) {
      const id = this.data[index];

      if (id === 0) {
        continue;
      }

      yield {
        id,
        index
      };
    }
  }

}

export class ObjectLayer {
  constructor(public readonly data: MapObject[]) {}
}

export class LayerGroup<T> {
  constructor(public readonly children: T[]) {}
}

export type Layer = TileLayer | ObjectLayer | LayerGroup<Layer>;
