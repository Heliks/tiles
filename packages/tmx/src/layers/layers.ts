import { Rectangle } from '@heliks/tiles-math';
import { HasProperties, Properties } from '../properties';
import { GameObject } from './objects';

/** Available layer types. */
export enum LayerType {
  /**
   * Layer contains tiles on a tile grid.
   * @see TileLayer
   */
  Tiles,
  /**
   * Layer contains freely placed objects.
   * @see ObjectLayer
   */
  Objects
}

interface Foo<D, P, T extends LayerType> extends HasProperties<P> {
  name: string;
  data: D;
  type: T;
}



/** @internal */
abstract class BaseLayer<D, P extends Properties = Properties> implements HasProperties<P> {
  /**
   * @param name Custom layer name.
   * @param data Layer data.
   * @param properties Custom layer properties.
   */
  constructor(
    public readonly name: string,
    public readonly data: D,
    public readonly properties: P
  ) {}

}

/** Layer that contains freely placed objects. */
export class ObjectLayer extends BaseLayer<GameObject[]> {
  public readonly type =  LayerType.Objects;
}


export type TileChunk = number[];

/** Layer that contains tiles. */
export class TileLayer extends BaseLayer<TileChunk[]> {
  public readonly type = LayerType.Tiles;
}

export type Layer = ObjectLayer | TileLayer;
