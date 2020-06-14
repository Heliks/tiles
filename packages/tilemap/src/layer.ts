export enum LayerType {
  Objects,
  Tiles
}

export interface BaseLayer {
  type: LayerType;
}

/** A layer that contains tiles. */
export class ObjectLayer implements BaseLayer {
  /** @inheritDoc */
  public readonly type = LayerType.Objects;
}

/** A layer that contains tiles structured in a grid. */
export class TileLayer implements BaseLayer {

  /** @inheritDoc */
  public readonly type = LayerType.Tiles;

  constructor(public readonly data: number[]) {}

}

export type Layer = ObjectLayer | TileLayer;


