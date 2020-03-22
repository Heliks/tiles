export interface AnimationData {
  /**
   * Contains the indexes of all sprites of which the animation consists.
   */
  frames: number[];
  /**
   * Duration in milliseconds how long each frame is visible before the animation
   * switches to the next one.
   */
  frameDuration?: number;
}

export class SpriteAnimation implements Required<AnimationData> {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** Index of the current frame. */
  public frame = 0;

  /** The name of the animation that is currently playing. */
  public playing?: string;

  /**
   * The animation speed. Will be calculated together with the frame duration. If
   * the value is `0.5` and the [[frameDuration]] is `100`, the effective duration
   * a frame is displayed will be 50ms.
   */
  public speed = 1;

  /**
   * Name of an animation on the spritesheet of the [[SpriteDisplay]] that accompanies
   * this component on the same entity. Does not wait for the current animation to
   * complete.
   */
  public transform?: string;

  /**
   * @param frames {@inheritDoc}
   * @param frameDuration {@inheritDoc}
   */
  constructor(
    public frames: number[],
    public frameDuration = 100
  ) {}

  /** Resets the animation back to the beginning. */
  public reset(): this {
    this.elapsedTime = 0;
    this.frame = 0;
    this.speed = 1;

    return this;
  }

  /**
   * Updates the speed in which the animation is played. Closer to `0` is slower (while
   * `0` itself pauses the animation completely) and `1` is the default speed.
   */
  public setSpeed(speed: number): this {
    this.speed = speed;

    return this;
  }

  /** Sets the [[frames]] that are used to create the animation. */
  public setFrames(frames: number[]): this {
    this.frames.length = 0;
    this.frames.push(...frames);

    return this;
  }

  /**
   * Plays the animation with the given `name` on the [[SpriteDisplay]] that accompanies
   * this component. Does not wait for the current animation to complete.
   */
  public play(name: string): this {
    if (this.playing !== name) {
      // Change animation if it isn't currently playing already.
      this.transform = name;
    }
    else if (this.transform && this.transform !== name) {
      // If requested animation is already playing but flagged for transform we can abort
      // the transform, since this play() call would transform it a second time back to
      // the animation that is playing now already.
      this.transform = undefined;
    }

    return this;
  }

}

