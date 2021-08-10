import { Vec2, vec2 } from '@heliks/tiles-engine';

/**
 * Describes how the game "Screen" should look like. For example, how big is the
 * viewport, what resolution, etc. Most changes to the screen do not happen immediately
 * on the users end, but instead require a frame tick so that the rendering system can
 * update the screen.
 */
export class Screen {

  /**
   * Indicates if the screen was updated recently and changes need to be applied by the
   * renderer system. Set this to `true` if you want to force the renderer to update
   * the screen.
   */
  public dirty = true;

  /**
   * Screen resolution in px. Do not update this directly.
   * Todo: Implement a way to switch screen resolutions.
   */
  public readonly resolution: Vec2;

  /**
   * The scale in which everything is rendered. Should not be updated manually because
   * this is calculated based on resolution and screen size.
   */
  public readonly scale = vec2(1, 1);

  /**
   * Screen size in px. Do not update this directly.
   * @see resize()
   */
  public readonly size: Vec2;

  /**
   * @param w Initial width of the screen in px.
   * @param h Initial height of the screen in px.
   * @param rw Resolution width in px.
   * @param rh Resolution height in px.
   * @param unitSize Amount of pixels that are equivalent to 1 unit in the game
   *  world. This unit size is applied to most values that are fed into the renderer to
   *  translate in-game unit measurements to pixel dimensions on screen.
   */
  constructor(w: number, h: number, rw: number, rh: number, public unitSize = 1) {
    this.size = vec2(w, h);
    this.resolution = vec2(rw, rh);
  }

  /** Resizes the screen. Also re-calculates the [[scale]]. */
  public resize(width: number, height: number): this {
    this.size.x = width;
    this.size.y = height;

    this.scale.x = width / this.resolution.x;
    this.scale.y = height / this.resolution.y;

    // Indicate that there are changes that need to be carried over to the renderer.
    this.dirty = true;

    return this;
  }

  /** Converts a `position` on the screen to a position in the game world. */
  /*
  public toWorld(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = ((position.x / this.scale.x) - (this.x) ) / this.unitSize;
    out.y = ((position.y / this.scale.y) - (this.y) ) / this.unitSize;

    return out;
  }
   */

  /** Converts a `position` in the world space to a position on the screen. */
  /*
  public toScreen(position: Vec2, out = vec2(0, 0)): Vec2 {
    out.x = (-position.x * this.unitSize) + (this.resolution.x / 2);
    out.y = (-position.y * this.unitSize) + (this.resolution.y / 2);

    return out;
  }
   */

}
