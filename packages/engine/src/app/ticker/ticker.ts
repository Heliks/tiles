/** Callback for a {@link Ticker}. */
export type TickerCallback = (delta: number) => void;

/** Executes the game loop. */
export abstract class Ticker {

  /** Last known delta time in ms. */
  public delta = 0;

  /** @internal */
  protected readonly listeners: TickerCallback[] = [];

  /** Starts the ticker. */
  public abstract start(): void;

  /** Stops the ticker. */
  public abstract stop(): void;

  /** Adds the given `fn` to the ticker. */
  public add(fn: TickerCallback): void {
    this.listeners.push(fn);
  }

  /** Returns the delta time converted to seconds. */
  public getDeltaSeconds(): number {
    return this.delta / 1000;
  }

}
