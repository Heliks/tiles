import { FlipMode } from '../flip';

/** Component to animate a `SpriteDisplay` component. */
export class SpriteAnimation {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** Direction in which the sprites of this animation should be flipped. */
  public flipMode = FlipMode.None;

  /**
   * Index of the frame that is currently displayed by the animation. A value of `-1`
   * means that the animation hasn't yet rendered a frame to the sprite display.
   */
  public frame = -1;

  /** If set to `true` the animation will start from scratch after it has completed. */
  public loop = true;

  /** The name of the animation that is currently playing. */
  public playing?: string;

  /**
   * The speed at which the animation is played. If the animation has a frame duration
   * of `100ms` and a speed of `0.5` the real frame duration will be `50ms`.
   */
  public speed = 1;

  /**
   * Name of the animation that should be played next. The animation data that will be
   * used is from the [[SpriteDisplay]] component adjacent to this animation. This
   * does not wait for the current animation to complete.
   *
   * Do not modify this directly and instead use [[play()]] to avoid unwanted side-
   * effects.
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

    this.elapsedTime = 0;
    this.speed = 1;

    this.flipMode = FlipMode.None;

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
   * Plays the animation with the given `name` on the [[SpriteDisplay]] that accompanies
   * this component. Does not wait for the current animation to complete.
   *
   * @param name The name of the animation that should be played.
   * @param loop (optional) If set to `true` the animation will start playing
   *  from the beginning again after it completes.
   */
  public play(name: string, loop = true): this {
    // Only start playing the animation if we aren't playing it already.
    if (this.playing !== name) {
      this.loop = loop;
      this.transform = name;
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
   * Returns `true` if the animation is "complete". An animation is considered complete
   * when it displays its last frame. If the animation loops it means that it is
   * considered incomplete on the next frame again.
   */
  public isComplete(): boolean {
    return this.frame === this.frames.length - 1;
  }

}

