import { Grid } from '@heliks/tiles-engine';
import { HasProperties, Properties } from '../properties';
import { GameObject } from '../objects';

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



/** @internal */
abstract class BaseLayer<D, P extends Properties = Properties> implements HasProperties<P> {

  /**
   * @param name Custom layer name.
   * @param data Layer data.
   * @param properties Custom layer properties.
   * @param isVisible Determines if the layer is visible or not.
   */
  constructor(
    public readonly name: string,
    public readonly data: D,
    public readonly properties: P,
    public readonly isVisible: boolean
  ) {}

}

/** Layer that contains freely placed objects. */
export class ObjectLayer extends BaseLayer<GameObject[]> {
  public readonly type =  LayerType.Objects;
}



export class TileChunk {

  /**
   * @param grid Grid that describes tile arrangement in this chunk. The columns and rows
   *  determine the amount of tiles in each chunk, cell size determines tile size.
   * @param data Tile data.
   * @param x X axis position in px, relative to the top left corner of the map.
   * @param y Y axis position in px, relative to the top left corner of the map.
   */
  constructor(
    public readonly grid: Grid,
    public readonly data: number[],
    public readonly x: number,
    public readonly y: number
  ) {}

}

/** Layer that contains tiles. */
export class TileLayer extends BaseLayer<TileChunk[]> {
  public readonly type = LayerType.Tiles;
}

export type Layer = ObjectLayer | TileLayer;
