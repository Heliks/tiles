/** Component to animate a `SpriteDisplay` component. */
export class SpriteAnimation {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** If set to `true` all frames in the animation will be flipped on the x axis. */
  public flipX = false;

  /** If set to `true` all frames in the animation will be flipped on the y axis. */
  public flipY = false;

  /**
   * Index of the frame that is currently displayed by the animation. A value of `-1`
   * means that the animation hasn't yet rendered a frame to the sprite renderer.
   */
  public frame = -1;

  /** If set to `true` the animation will start from scratch after it has completed. */
  public loop = true;

  /**
   * Amount of times that the animation has looped. If the animation does not loop,
   * this will have no effect.
   *
   * Will be reset when a different animation starts to be played.
   *
   * @see loop
   */
  public loops = 0;

  /** The name of the animation that is currently playing. */
  public playing?: string;

  /**
   * The speed at which the animation is played. If the animation has a frame duration
   * of `100ms` and a speed of `0.5` the real frame duration will be `50ms`.
   */
  public speed = 1;

  /**
   * Name of the animation that should be played next. The animation data that will be
   * used is from the [[SpriteDisplay]] component adjacent to this component. Does not
   * wait for the current animation to complete.
   *
   * Do not modify this directly. Use `play()` to modify the current animation.
   *
   * @see play()
   */
  public transform?: string;

  /**
   * @param frames Contains the indexes of all sprites of which the animation consists.
   * @param frameDuration Duration in ms of how long each frame is displayed.
   */
  constructor(
    public frames: number[] = [],
    public frameDuration = 100
  ) {}

  /** Resets the animation back to the beginning. */
  public reset(): this {
    this.frame = -1;
    this.frameDuration = 100;

    this.elapsedTime = -1;
    this.speed = 1;

    this.loops = 0;

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
    this.frames = frames;

    // Make sure the animation gets updated by the animation system.
    this.frame = -1;

    // If we manually set the frames we know that there is no named
    // animation playing right anymore.
    this.playing = undefined;

    return this;
  }

  /**
   * Plays the animation with the given `name`. The animation data is derived from
   * the `SpriteDisplay` of this entity.
   *
   * @param name Name of the animation that should be played.
   * @param loop (optional) If set to `true` the animation will start playing
   *  from the beginning again after it completes.
   */
  public play(name: string, loop = true): this {
    // Only start playing the animation if we aren't playing it already.
    if (this.playing !== name) {
      this.loop = loop;

      this.transform = name;

      this.flipX = false;
      this.flipY = false;
    }
    else if (this.transform && this.transform !== name) {
      // If requested animation is already playing but flagged for transform we can abort
      // the transform, since this play() call would transform it a second time back to
      // the animation that is playing now.
      this.transform = undefined;
    }

    return this;
  }

  /**
   * Returns `true` if the animation with the given `name` is played right now or if the
   * it is about to be transformed into that animation.
   *
   * @see playing
   * @see transform
   */
  public isPlaying(name: string): boolean {
    return this.playing === name || this.transform === name;
  }

  /**
   * Returns `true` if the current animation is complete.
   *
   * The animation is considered complete when it is displaying its last frame. This means
   * that if the animation loops the result of this function is only valid for one frame.
   *
   * The animation is always considered incomplete when it is queued to be changed to a
   * different animation.
   */
  public isComplete(): boolean {
    return this.transform === undefined && this.frame === this.frames.length - 1;
  }

  /**
   * Flips all frames in the animation.
   *
   * @param x If set to `true` all frames will be flipped on the x axis.
   * @param y If set to `true` all frames will be flipped on the y axis.
   */
  public flip(x = false, y = false): this {
    this.flipX = x;
    this.flipY = y;

    return this;
  }

}

