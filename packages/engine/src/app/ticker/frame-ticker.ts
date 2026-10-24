import { Ticker } from './ticker';


/**
 * Implementation of a {@link Ticker} that executes its callbacks using the web browser
 * animation frame.
 */
export class FrameTicker extends Ticker {

  /** @internal */
  private started = false;

  /** Id of the animation frame request if there is one. */
  private requestId?: number;

  /** Timestamp of the last frame the ticker ran. */
  private lastTick = 0;

  /** Updates delta times and calls each `ListenerFn`.  */
  public update(currentTime: number): void {
    this.delta = (currentTime - this.lastTick);

    // Call all listeners.
    for (const fn of this.listeners) {
      fn(this.delta);
    }

    this.lastTick = currentTime;
  }

  /**
   * The `requestAnimationFrame() callback.
   *
   * This is defined as an anonymous function because it's faster to call this directly
   * rather than to `bind()` the function.
   *
   * @internal
   */
  private tick = (currentTime: number): void => {
    if (! this.started) {
      this.requestId = undefined;

      return;
    }

    // If the game tick even takes a few ms too long, we can miss the compositors'
    // next scheduling window. This can cause dropped frames. To avoid this, request
    // the next animation frame immediately.
    this.requestId = requestAnimationFrame(this.tick);

    this.update(currentTime);
  };

  /** @inheritDoc */
  public start(): void {
    if (! this.started) {
      this.started = true;
      this.lastTick = performance.now();
      this.requestId = requestAnimationFrame(this.tick);
    }
  }

  /** @inheritDoc */
  public stop(): void {
    if (this.started) {
      this.started = false;

      // If a frame is already requested, cancel it.
      if (this.requestId) {
        cancelAnimationFrame(this.requestId);

        this.requestId = undefined;
      }
    }
  }

}
