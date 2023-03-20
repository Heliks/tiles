/**
 * Tracks elapsed time in ms.
 *
 * Timers can either repeat or not. Repeating timers will only be finished for the
 * tick on which they exceeded their duration. Non-repeating timers will stay finished
 * until they are manually reset.
 */
export class Timer {

  /** Elapsed time in ms. */
  public elapsed = 0;

  /**
   * Contains `true` if the timer has finished. For {@link repeat repeating} timers this
   * result will only stay valid until the next {@link update tick} happens.
   */
  public finished = false;

  /**
   * Contains the amount of times that the timer finished on this tick.
   *
   * @internal
   */
  private finishes = 0;

  /**
   * @param duration Duration in ms until the timer finishes.
   * @param repeat If set to `true`, the timer will repeat once it has finished.
   */
  constructor(public duration: number, public repeat = false) {}

  /** Returns `true` on the tick on which the timer has {@link finished}. */
  public hasFinishedThisTick(): boolean {
    return this.finishes > 0;
  }

  /** Advances the timer by `delta` ms. */
  public update(delta: number): void {
    if (this.finished && !this.repeat) {
      return;
    }

    this.elapsed += delta;
    this.finished = this.elapsed >= this.duration;

    if (this.finished) {
      if (this.repeat) {
        this.finishes = Math.floor(this.elapsed / this.duration);
        this.elapsed = this.elapsed - (this.duration * this.finishes);
      }
      else {
        this.finishes = 1;
        this.elapsed = this.duration;
      }
    }
    else {
      this.finishes = 0;
    }
  }

  /** Resets the timer. */
  public reset(): this {
    this.finishes = 0;
    this.finished = false;
    this.elapsed = 0;

    return this;
  }

}
