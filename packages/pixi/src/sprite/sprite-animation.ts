export class SpriteAnimation {

  /** Index of the current frame. */
  public frame = 0;

  /**
   * The duration that each frame is displayed before switching to
   * the next (in MS).
   */
  public speed = 100;

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /**
   * @param frames An array containing the Ids of all sprites that make
   *  up the sprite animation.
   */
  constructor(public readonly frames: number[]) {}

  /** Sets the [[frames]] that are used to create the animation. */
  public setFrames(frames: number[]): this {
    this.frames.length = 0;
    this.frames.push(...frames);

    return this;
  }

}