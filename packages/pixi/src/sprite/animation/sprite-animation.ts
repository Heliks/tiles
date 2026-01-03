import { TypeId } from '@heliks/tiles-engine';


/** Component to animate a `SpriteDisplay` component. */
@TypeId('tiles_renderer_sprite_animation')
export class SpriteAnimation {

  /** Elapsed time since the animation has started. */
  public elapsedTime = -1;

  /** Flips all animation frames along the x-axis. */
  public flipX = false;

  /** Flips all animation frames along the y-axis. */
  public flipY = false;

  /**
   * Index of the active animation frame. A value of `-1` means that no animation has
   * been played yet.
   */
  public frame = -1;

  /** If enabled, the animation will restart after it completes. */
  public loop = true;

  /**
   * Number of times the animation has been restarted. Will be reset when a different
   * animation is {@link play played}. The counter remains at `0` if {@link loop} is
   * disabled.
   */
  public loops = 0;

  /** Pauses the animation. */
  public paused = false;

  /** Name of the animation that is currently playing, if any. */
  public playing?: string;

  /**
   * Name of the animation that should be played next. Don't modify this directly and
   * use {@link play()} to properly switch to a different animation.
   *
   * @internal
   */
  public transform?: string;

  /**
   * @param frames Contains the sprite IDs of each animation frame.
   * @param frameDuration Duration in ms of how long each frame is displayed.
   * @param speed Animation speed. For example, an animation with a frame duration of
   * 100 ms and a speed of 0.5 will have a real frame duration of 200 ms.
   */
  constructor(public frames: number[] = [], public frameDuration = 100, public speed = 1) {}

  /** Resets the animation back to the beginning. */
  public reset(): this {
    this.frame = -1;
    this.frameDuration = 100;

    this.elapsedTime = -1;
    this.speed = 1;

    this.loops = 0;

    return this;
  }

  /** Sets the animation {@link speed}. */
  public setSpeed(speed: number): this {
    this.speed = speed;

    return this;
  }

  /** Sets the animation {@link frames}. */
  public setFrames(frames: number[]): this {
    this.frames = frames;

    // Make sure the animation gets updated by the animation system.
    this.frame = -1;
    this.playing = undefined;

    return this;
  }

  /**
   * Flips the animation frames.
   *
   * @param x If `true`, frames are flipped along the x-axis.
   * @param y If `true`, frames are flipped along the y-axis.
   */
  public flip(x = false, y = false): this {
    this.flipX = x;
    this.flipY = y;

    return this;
  }

  /**
   * Plays the animation with the given `name`. The animation data is derived from
   * the {@link SpriteRender} component attached to the owner of this animation.
   *
   * @param name Name of the animation that should be played. This should correspond
   *  to a valid animation defined in the {@link SpriteRender} spritesheet that is
   *  attached to the owner of this component.
   * @param loop (optional) If enabled, the animation will play in a continuous loop. If
   *  disabled, the animation will play once and then remain on its last frame.
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
      // The user has most likely called play() a second time before the transform was
      // applied. If we don't reset this here, this would "change" the animation to the
      // one that is actually playing right now.
      this.transform = undefined;
    }

    return this;
  }

  /**
   * Checks if the given animation `name` is currently {@link playing} or about to be
   * played on the next game tick.
   */
  public isPlaying(name: string): boolean {
    return this.playing === name || this.transform === name;
  }

  /**
   * Returns `true` if the animation that is currently playing is complete.
   *
   * The animation is considered complete when it is displaying its last frame. This
   * means that if the animation loops that this result is only valid for as long as
   * it stays on that frame. The animation is always incomplete when it is about to
   * be transformed.
   */
  public isComplete(): boolean {
    return this.transform === undefined && this.frame === this.frames.length - 1;
  }

  /**
   * Calculates the index of the active animation frame based on the animation
   * duration and the {@link elapsedTime elapsed time}.
   */
  public getNextFrame(): number {
    return (this.elapsedTime / (this.frameDuration / this.speed)) % this.frames.length | 0;
  }

  /**
   * Performs the animation step. Returns `true` if the animation {@link frame} has been
   * changed in the process.
   *
   * @example
   * ```ts
   *  if (animation.step(delta)) {
   *    // Frame has been changed.
   *    sprite.spriteId = animation.frames[frame];
   *  }
   * ```
   *
   * @param delta Elapsed time since the last animation step.
   */
  public step(delta: number): boolean {
    if (this.paused || (! this.loop && this.isComplete())) {
      return false;
    }

    this.elapsedTime += delta;

    if (this.frames.length === 0) {
      return false;
    }

    const next = this.getNextFrame();

    if (next === this.frame) {
      return false;
    }

    this.frame = next;

    if (next === 0) {
      this.loops++;
    }

    return true;
  }

}

