import { Rectangle as PxRectangle } from 'pixi.js';

/**
 * A sprite that has its original dimensions reduced (packed) to its lowest possible size.
 *
 * @see PackedSpriteSheet
 * @see SpriteSheet
 */
export class PackedSprite extends PxRectangle {

  /**
   * Original dimension of the sprite before it was packed. Applied to the texture that
   * will be created from it.
   */
  public source = new PxRectangle();

}
