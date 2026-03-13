import { Ignore, TypeId } from '@heliks/tiles-engine';
import { SpriteAnimationFrames } from '../sprite-sheet';


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

  /** @internal */
  @Ignore()
  public readonly transform = {
    active: false,
    animation: '',
    preserve: false
  };

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
   * Plays the given `animation`.
   *
   * When `preserve` is enabled, the current frame and frame progress are copied to the
   * new animation. This allows smooth transitions between animations that share
   * compatible frame strips.
   *
   * @param animation Sprite animation to play.
   * @param preserve If `true`, the current frame and frame progress are preserved when
   *  switching animations.
   */
  public setAnimation(animation: SpriteAnimationFrames, preserve = false): this {
    const frame = this.frame;
    const fraction = this.getFrameProgress();

    this.reset();

    // Don't copy a reference here, otherwise editing the animation frames would also
    // edit the original `AnimationData`.
    this.frames = [
      ...animation.frames
    ];

    if (animation.frameDuration) {
      this.frameDuration = animation.frameDuration;
    }

    if (preserve) {
      // The current frame is based on elapsed time. Therefore, fast-forward to where
      // the previous frame index should be on the new animation. Also take its progress
      // into account to not extend the duration of this frame.
      this.elapsedTime = this.frameDuration * (frame + fraction);
      this.frame = frame;
    }

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
   * Plays the animation with the given `name`.
   *
   * Animation data is resolved from the {@link SpriteRender} component attached to the
   * owner of this animation.
   *
   * When `preserve` is enabled, the current frame and frame progress are copied to the
   * new animation. This allows smooth transitions between animations that share
   * compatible frame strips.
   *
   * @param name Name of the animation to play.
   * @param loop If `true`, the animation will repeat continuously. If `false`, it will
   *  stop on the final frame.
   * @param preserve If `true`, the current frame and frame progress are preserved when
   *  switching animations.
   */
  public play(name: string, loop = true, preserve = false): this {
    // Only start playing the animation if we aren't playing it already.
    if (this.playing !== name) {
      this.transform.active = true;
      this.transform.animation = name;
      this.transform.preserve = preserve;

      this.loop = loop;
      this.flipX = false;
      this.flipY = false;
    }
    else if (this.transform.active && this.transform.animation !== name) {
      // The user has most likely called play() a second time before the transform was
      // applied. If we don't reset this here, this would "change" the animation to the
      // one that is actually playing right now.
      this.transform.active = false
    }

    return this;
  }

  /**
   * Checks if an animation is currently playing or is about to be played on the next
   * game tick.
   */
  public isPlaying(name: string): boolean {
    return this.playing === name || this.hasTransform(name);
  }

  /** Checks if the animation has a pending transform to the given animation name. */
  public hasTransform(name: string): boolean {
    return this.transform.active && this.transform.animation === name;
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
    return ! this.transform.active && this.frame === this.frames.length - 1;
  }

  /**
   * Calculates the index of the active animation frame based on the animation
   * duration and the {@link elapsedTime elapsed time}.
   */
  public getNextFrame(): number {
    return (this.elapsedTime / this.getFrameDuration()) % this.frames.length | 0;
  }

  /** Calculates the progress of the current animation frame. */
  public getFrameProgress(): number {
    const duration = this.getFrameDuration();

    return (this.elapsedTime % duration) / duration;
  }

  /** Returns the duration of each frame, taking the {@link speed} into account. */
  public getFrameDuration(): number {
    return this.frameDuration / this.speed;
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

