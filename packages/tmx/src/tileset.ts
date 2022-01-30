import { Align } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';
import { Properties } from './properties';
import { Shape } from './shape';


/** @inheritDoc */
export class Tileset extends Base {

  /**
   * Positions of objects that are placed via this tilesets are relative to this
   * alignment mode. By default tiled uses the objects bottom left corner.
   *
   * @see Align
   */
  public objectAlign = Align.BottomLeft;

  /** Contains tile shapes, mapped to the tileId to which they belong. */
  private readonly shapes = new Map<number, Shape[]>();

  /** Contains custom properties associated with a certain tile ID. */
  public readonly tileProperties = new Map<number, Properties>();

  /**
   * Returns all shapes that belong to the tile matching `tileId`. Returns `undefined`
   * if that tile does not have any shapes.
   */
  public getTileShapes(tileId: number): Shape[] | undefined {
    return this.shapes.get(tileId);
  }

  /**
   * Assigns shapes to the tile matching `id`. This overwrites any shapes that were
   * previously assigned to that tile.
   */
  public setTileShapes(tileId: number, shapes: Shape[]): this {
    this.shapes.set(tileId, shapes);

    return this;
  }

  /**
   * Returns the custom properties associated with the tile matching `tileId`, if any.
   *
   * @typeparam P Expected format of the tile properties. This is not type safe.
   */
  public getTileProperties<P extends Properties>(tileId: number): P | undefined {
    return this.tileProperties.get(tileId) as P;
  }

}
