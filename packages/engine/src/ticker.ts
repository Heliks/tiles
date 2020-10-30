/** @internal */
type ListenerFn = (delta: number) => void;

/** The ticker used to run the games update loop. */
export class Ticker {

  /** @internal */
  private started = false;

  /** @internal */
  private listeners: ListenerFn[] = [];

  /** Id of the animation frame request if there is one. */
  private requestId?: number;

  /** Contains the delta time in MS. */
  public delta = -1;

  /**
   * Timestamp of the last frame the ticker ran. A value of `-1` means the ticker has not
   * been started yet.
   */
  private lastTick = -1;

  /** Returns the delta time converted to seconds. */
  public getDeltaSeconds(): number {
    return this.delta / 1000;
  }

  /** Returns `true` if a new animation frame can be requested. */
  public canRequestFrame(): boolean {
    return this.started && !this.requestId;
  }

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
   * The `requestAnimationFrame()` callback.
   *
   * Note: This is declared as a closure because in high performance scenarios they are
   *  significantly faster than a method that is wrapped with `.bind()`.
   */
  private tick = (currentTime: number): void => {
    this.requestId = undefined;

    if (this.started) {
      this.update(currentTime);

      // Side effects could've changed the state
      if (this.canRequestFrame()) {
        this.requestId = requestAnimationFrame(this.tick);
      }
    }
  };

  /** Starts the ticker. */
  public start(): void {
    // Only start the ticker if it isn't already running.
    if (!this.started) {
      this.started = true;
      this.requestId = requestAnimationFrame(this.tick);
    }
  }

  /** Stops the ticker. */
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

  /** Adds the given `fn` to be called on each frame if the ticker is started. */
  public add(fn: ListenerFn): void {
    this.listeners.push(fn);
  }

}
