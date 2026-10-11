import { Ticker } from './ticker';


/**
 * Ticker that executes the game loop at a fixed time interval.
 *
 * This ticker is most suited for server-side and node apps where frame-based timing is
 * not available or necessary. It uses `setTimeout` to maintain a consistent execution
 * interval.
 *
 * For game frontends, the {@link FrameTicker} or a different frame-based ticker
 * is recommended instead.
 */
export class IntervalTicker extends Ticker {

  /** Contains the last known timestamp in ms. */
  private timestamp = -1;

  /** Contains the ID of the current `setTimeout`. */
  private timeoutId?: number;

  /**
   * @param interval Interval between ticks in ms.
   */
  constructor(private readonly interval = 1000 / 60) {
    super();
  }

  /**
   * The `setTimeout() callback.
   *
   * This is defined as an anonymous function because it's faster to call this directly
   * rather than to `bind()` the function.
   */
  private tick = (): void => {
    const now = Date.now();

    this.delta = now - this.timestamp;
    this.timestamp = now;

    for (const fn of this.listeners) {
      fn(this.delta);
    }

    this.timeoutId = setTimeout(this.tick, this.interval);
  }

  /** @inheritDoc */
  public start(): void {
    this.timestamp = Date.now();
    this.tick();
  }

  /** @inheritDoc */
  public stop(): void {
    clearTimeout(this.timeoutId);
  }

}
