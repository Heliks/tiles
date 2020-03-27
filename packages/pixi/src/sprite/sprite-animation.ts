import { FlipDirection } from "../utils";

export interface AnimationData {
  /** The direction in which the sprites of all frames should be flipped. */
  flip?: FlipDirection;
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

export class SpriteAnimation implements AnimationData {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** The direction in which the sprites of all frames should be flipped. */
  public flip = FlipDirection.None;

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
   * Name of an animation on the sprite-sheet of the [[SpriteDisplay]] that accompanies
   * this component on the same entity to which this animation should be changed to.
   * Does not wait for the current animation to complete.
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
    this.frame = -1;
    this.speed = 1;

    this.flip = FlipDirection.None;

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
   */
  public play(name: string): this {
    if (this.playing !== name) {
      // Change animation if it isn't currently playing already.
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

  /** Flips the sprite of each frame in the animation in the given direction. */
  public flipTo(direction = FlipDirection.Horizontal): this {
    this.flip = direction;

    return this;
  }

}

