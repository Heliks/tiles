import { Pivot, PivotPreset } from '@heliks/tiles-engine';
import { Tileset } from '@heliks/tiles-tilemap';
import { TmxTile } from './tmx-tile';


/** @inheritDoc */
export class TmxTileset extends Tileset {

  /**
   * When an object is using a sprite from this tileset, this {@link Pivot} should be
   * used by the sprite as an anchor. By default, they are aligned based on their
   * bottom-left corner.
   */
  public pivot: Pivot = PivotPreset.BOTTOM_LEFT;

  /**
   * Contains {@link TmxTile tiles} mapped to the index it occupies on the tileset.
   *
   * Note: Tiled only creates tile objects for tiles with properties, animations, shapes
   * etc., hence why not all tiles in a tileset have an entry here.
   */
  public readonly tiles = new Map<number, TmxTile>();

}
