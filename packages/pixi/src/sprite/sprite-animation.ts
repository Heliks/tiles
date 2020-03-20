export class SpriteAnimation {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** Index of the current frame. */
  public frame = 0;

  /**
   * The duration that each frame is displayed before switching to
   * the next (in MS).
   */
  public frameDuration = 100;

  /**
   * The animation speed. Will be calculated together with the frame duration. If
   * the value is `0.5` and the [[frameDuration]] is `100`, the effective duration
   * a frame is displayed will be 50ms.
   */
  public speed = 1;

  /**
   * @param frames An array containing the Ids of all sprites that make
   *  up the sprite animation.
   */
  constructor(public readonly frames: number[]) {}

  /**
   * Updates the animation speed.
   *
   * @see speed
   * @see frameDuration
   */
  public setAnimationSpeed(speed: number): this {
    this.speed = speed;

    return this;
  }

  /** Updates the time that each frame is visible. */
  public setFrameDuration(ms: number): this {
    this.frameDuration = ms;

    return this;
  }
  /** Sets the [[frames]] that are used to create the animation. */
  public setFrames(frames: number[]): this {
    this.frames.length = 0;
    this.frames.push(...frames);

    return this;
  }

}

