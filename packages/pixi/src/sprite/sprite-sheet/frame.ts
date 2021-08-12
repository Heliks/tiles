import { Rectangle as PxRectangle } from 'pixi.js';

/** An individual image in a sprite collection. */
export class Frame extends PxRectangle {

  /**
   * The area of the frame before it was put in a sprite collection (an possibly
   * trimmed). Applied to the texture that is created from the frame to preserve
   * original relative position to other sprites.
   */
  public source = new PxRectangle();

}
