import { clamp } from '@tiles/engine';

export interface Bounds {
  h: number;
  w: number;
  x: number;
  y: number;
}

export class Camera {

  /**
   * If set to `true` values such as [[x]] or [[y]] will be rounded to
   * their nearest integer value. This is useful for preventing sub-pixel
   * aliasing when dealing with pixel art.
   */
  public roundValues = false;

  /**
   * The scale in which the camera perceives the surrounding environment.
   */
  public scale = 1;

  /**
   * The boundaries in which the camera is free to move around.
   */
  public bounds?: Bounds;

  constructor(
    public width: number,
    public height: number,
    public x = 0,
    public y = 0,
    public rotation = 0
  ) {}

  /**
   *
   */
  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   *
   */
  public setRotation(value: number): this {
    this.rotation = value;

    return this;
  }

  /**
   *
   */
  public setBounds(bounds: Bounds): this {
    this.bounds = bounds;

    return this;
  }

  /** Returns the real width of the camera viewport in px, factoring in [[scale]]. */
  public getRealWidth(): number {
    return this.width * this.scale;
  }

  /** Returns the real height of the camera viewport in px, factoring in [[scale]]. */
  public getRealHeight(): number {
    return this.height * this.scale;
  }

  /** Clamps the given value `y` to the cameras horizontal boundaries. */
  public clampX(x: number): number {
    if (!this.bounds) {
      return x;
    }

    const width = this.getRealWidth();

    // Calculate min and max position based on camera bounds.
    const min = this.bounds.x + ((width - this.width) / 2);
    const max = min + this.bounds.w;

    return clamp(x, min, max);
  }

  /** Clamps the given value `y` to the cameras vertical boundaries. */
  public clampY(y: number): number {
    if (!this.bounds) {
      return y;
    }

    const height = this.getRealHeight();

    // Calculate min and max position based on the camera bounds.
    const min = this.bounds.y + ((height - this.height) / 2);
    const max = min + this.bounds.h;

    return clamp(y, min, max);
  }

}
