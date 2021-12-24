import { Align } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';


export class Tileset extends Base {

  /**
   * Objects that are placed via this tileset have positions be relative to this
   * alignment mode.
   */
  public objectAlign = Align.BottomLeft;

}