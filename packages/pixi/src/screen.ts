import { Vec2 } from '@heliks/tiles-engine';
import { Align, alignTo } from './align';


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
   * Scale in which everything is rendered. Should not be updated manually because
   * this is calculated at runtime.
   */
  public readonly scale = new Vec2(1, 1);

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
    this.size = new Vec2(w, h);
    this.resolution = new Vec2(rw, rh);
  }

  /**
   * Realigns the given `pos` to the screens boundaries.
   *
   * @param pos Position that should be realigned.
   * @param align To where position should be aligned to.
   * @param out (optional) Vector to which new position will be written to.
   */
  public align(pos: Vec2, align: Align, out = new Vec2(0, 0)): Vec2 {
    return alignTo(pos, this.size.x, this.size.y, align, out);
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

}
