import { Align } from '@heliks/tiles-pixi';
import { Tileset as Base } from '@heliks/tiles-tilemap';
import { TmxProperties } from './tmx-properties';
import { TmxShape } from './tmx-shape';


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

  /** Contains custom properties associated with a certain tile ID. */
  public readonly tileProperties = new Map<number, TmxProperties>();

  /** Contains tile shapes, mapped to the tileId to which they belong. */
  private readonly shapes = new Map<number, TmxShape[]>();


}
