import { Vec2 } from "@tiles/engine";

/** Manages the dimensions of the screen. */
export class ScreenDimensions {

  /** Indicates if the screen dimensions were updated recently. */
  public dirty = true;

  private readonly _scale: Vec2 = [1, 1]
  private readonly _resolution: Vec2;
  private readonly _size: Vec2;

  /**
   * Vector that contains the width and height in px of the resolution in which the
   * screen is rendered.
   */
  public get resolution(): Readonly<Vec2> {
    return this._resolution;
  }

  /**
   * Vector that contains the scale in which the game stage has to be rendered so that
   * the [[resolution]] meets the expected [[size]].
   */
  public get scale(): Readonly<Vec2> {
    return this._scale;
  }

  /** Vector that contains the width and height of the screen in px. */
  public get size(): Readonly<Vec2> {
    return this._size;
  }

  /**
   * @param w Initial width of the screen in px.
   * @param h Initial height of the screen in px.
   * @param rw Resolution width in px.
   * @param rh Resolution height in px.
   * @param unitSize Value by which positions that are fed into the rendering module must
   *  be multiplied to translate those values into pixel positions.
   */
  constructor(w: number, h: number, rw: number, rh: number, public unitSize = 1) {
    this._size = [w, h];
    this._resolution = [rw, rh];
  }

  /** Resizes the screen dimensions. This also re-calculates the [[scale]]. */
  public resize(width: number, height: number): this {
    this._size[ 0 ] = width;
    this._size[ 1 ] = height;

    this._scale[ 0 ] = width / this._resolution[ 0 ];
    this._scale[ 1 ] = height / this._resolution[ 1 ];

    // Indicate that there are changes that need to be carried over to the renderer.
    this.dirty = true;

    return this;
  }

}
