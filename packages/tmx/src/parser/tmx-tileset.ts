import { Align } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';
import { TmxTile } from './tmx-tile';


/** @internal */
function getTileAnimationName(tileId: number): string {
  return `tile-${tileId}-default`;
}

/** @inheritDoc */
export class TmxTileset extends Base {

  /**
   * Sprites created from this tileset should use this alignment setting as their pivot
   * position. By default, tiled uses the bottom-left corner for sprite pivots.
   */
  public align = Align.BottomLeft;

  /** Contains {@link TmxTile tiles} mapped to their tile ID. */
  public readonly tiles = new Map<number, TmxTile>();

}
