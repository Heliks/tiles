import { HasProperties, Properties } from '../properties';
import { GameObject } from './objects';

/** Available layer types. */
export enum LayerType {
  Tiles,
  Objects
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

/** Layer that contains tiles. */
export class TileLayer extends BaseLayer<number[]> {
  public readonly type = LayerType.Tiles;
}

export type Layer = ObjectLayer | TileLayer;
