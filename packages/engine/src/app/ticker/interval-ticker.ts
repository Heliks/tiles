import { Ticker } from './ticker';


/**
 * Ticker that executes its callbacks at a set interval.
 *
 * This ticker is most suited for servers and other node applications. For game clients
 * the {@link FrameTicker}, or other frame-based tickers should be others.
 */
export class IntervalTicker extends Ticker {

  /** Contains the last known timestamp. */
  private timestamp = -1;

  /** Contains the ID of the {@link setTimeout} for the next tick. */
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
   *
   * @internal
   */
  private tick = () => {
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
