import { Struct } from '@tiles/engine';

export enum LayerType {
  Objects,
  Tiles
}

export interface BaseLayer {
  /** Additional custom properties. */
  properties?: Struct;
  /** The layers type. */
  type: LayerType;
}

export interface WorldObject {
  /** The Id of the tile that the world object should display. */
  tileId?: number;
  /** An Id that is unique on the map on which the object is contained. */
  id: number;
  /** Object rotation in degrees (0-360). */
  rotation: number;
  /** Width in px. */
  width: number;
  /** Height in px. */
  height: number;
  /** Position on x axis. */
  x: number;
  /** Position on y axis. */
  y: number;
}

/** A layer that contains world objects. */
export class ObjectLayer implements BaseLayer {

  /** @inheritDoc */
  public readonly type = LayerType.Objects;

  constructor(
    public readonly data: WorldObject[],
    public readonly properties: Struct
  ) {}

}

/** A layer that contains tiles structured in a grid. */
export class TileLayer implements BaseLayer {

  /** @inheritDoc */
  public readonly type = LayerType.Tiles;

  /**
   * @param data
   * @param properties {@inheritDoc}
   */
  constructor(
    public readonly data: number[],
    public readonly properties: Struct
  ) {}

}

export type Layer = ObjectLayer | TileLayer;

