import { Align } from '@heliks/tiles-pixi';
import { Tileset } from '@heliks/tiles-tilemap';
import { TmxTile } from './tmx-tile';



/** @inheritDoc */
export class TmxTileset extends Tileset {

  /**
   * Sprites created from this tileset should use this alignment setting as their pivot
   * position. By default, tiled uses the bottom-left corner for sprite pivots.
   */
  public align = Align.BottomLeft;

  /**
   * Contains {@link TmxTile tiles} mapped to the index it occupies on the tileset.
   *
   * Note: Tiled only creates tile objects for tiles with properties, animations, shapes
   * etc., hence why not all tiles in a tileset have an entry here.
   */
  public readonly tiles = new Map<number, TmxTile>();

}
