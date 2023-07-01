import { Handle } from '@heliks/tiles-assets';
import { Pivot, PivotPreset } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Tileset } from '@heliks/tiles-tilemap';
import { TmxCustomTile } from './tmx-custom-tile';
import { TmxProperties } from './tmx-properties';

export interface TmxTilesetProps extends TmxProperties {

  /**
   * Contains a stringified JSON array of sprite animations.
   *
   * In tiled it is not possible to add separate, named animations. To circumvent this,
   * animation data from here is parsed and added to the internal spritesheet of the
   * tileset, where those animations can be used in-engine as usual.
   *
   * An example value of this could be:
   *
   * ```text
   *  [
   *    {
   *      "name": "foo",
   *      "frames: [1, 2, 3],
   *      "frameDuration: 100
   *    }
   *  ]
   * ```
   */
  $animations?: string;

}

/** @inheritDoc */
export class TmxTileset<T = unknown, P extends TmxTilesetProps = TmxTilesetProps> extends Tileset<T, TmxCustomTile<T>> {

  /**
   * When an object is using a sprite from this tileset, this {@link Pivot} should be
   * used by the sprite as an anchor. By default, tiled aligns objects based on their
   * bottom-left corner.
   */
  public pivot: Pivot = PivotPreset.BOTTOM_LEFT;

  /**
   * @param spritesheet Handle to the {@link SpriteSheet} used by this tileset.
   * @param size Total amount of tiles that are contained in this tileset.
   * @param props Custom properties found on the tileset itself.
   */
  constructor(spritesheet: Handle<SpriteSheet>, size: number, public readonly props: P) {
    super(spritesheet, size);
  }

}
