import { Align } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';
import { Shape } from './shape';


/** @inheritDoc */
export class Tileset extends Base {

  /**
   * Objects that are placed via this tileset have positions be relative to this
   * alignment mode.
   */
  public objectAlign = Align.BottomLeft;

  /** Contains tile shapes, mapped to the tileId to which they belong. */
  private readonly shapes = new Map<number, Shape[]>();

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

}