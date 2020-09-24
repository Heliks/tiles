import { Vec2 } from '@heliks/tiles-engine';

/** Manages the dimensions of the screen. */
export class ScreenDimensions {

  /** Indicates if the screen dimensions were updated recently. */
  public dirty = true;

  /**
   * The scale in which everything is rendered. Should not be updated manually because
   * this is calculated based on resolution and screen size.
   */
  public readonly scale: Vec2 = [1, 1];

  /**
   * Screen resolution in px. Do not update this directly.
   * Todo: Implement a way to switch screen resolutions.
   */
  public readonly resolution: Vec2;

  /** Screen size in px. Do not update this directly. Use [[resize()]] instead. */
  public readonly size: Vec2;

  /** Offset. */
  public readonly offset: Vec2 = [0, 0];

  /**
   * @param w Initial width of the screen in px.
   * @param h Initial height of the screen in px.
   * @param rw Resolution width in px.
   * @param rh Resolution height in px.
   * @param unitSize Value by which positions that are fed into the rendering module must
   *  be multiplied to translate those values into pixel positions.
   */
  constructor(w: number, h: number, rw: number, rh: number, public unitSize = 1) {
    this.size = [w, h];
    this.resolution = [rw, rh];
  }

  /** Resizes the screen dimensions. This also re-calculates the [[scale]]. */
  public resize(width: number, height: number): this {
    this.size[0] = width;
    this.size[1] = height;

    this.scale[0] = width / this.resolution[0];
    this.scale[1] = height / this.resolution[1];

    // Indicate that there are changes that need to be carried over to the renderer.
    this.dirty = true;

    return this;
  }

  /** Converts a screen `position` to a world position. */
  public toWorld(position: Vec2): Vec2 {
    position[0] = ((position[0] / this.scale[0]) - (this.offset[0]) ) / this.unitSize;
    position[1] = ((position[1] / this.scale[1]) - (this.offset[1]) ) / this.unitSize;

    return position;
  }

}
