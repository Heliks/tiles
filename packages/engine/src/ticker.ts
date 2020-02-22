export type ListenerFn = (delta: number) => void;

/** The ticker used to run the games update loop. */
export class Ticker {

  /** Indicates if the ticker is currently running. */
  protected started = false;

  /** Contains all listeners that will be called during `update()`. */
  protected listeners: ListenerFn[] = [];

  /** Id of the animation frame request if there is one. */
  protected requestId?: number;

  /**
   * The timestamp on which the last tick occurred. Contains `-1` if the
   * ticker hasn't been started yet.
   */
  protected lastTick = -1;

  /** Returns `true` if a new animation frame can be requested. */
  public canRequestFrame(): boolean {
    return this.started && !this.requestId;
  }

  /** Updates delta times and calls each `ListenerFn`.  */
  public update(currentTime: number) {
    // Call all listeners.
    for (const fn of this.listeners) {
      fn(currentTime);
    }

    this.lastTick = currentTime;
  }

  /**
   * The `requestAnimationFrame()` callback.
   * The reason this is declared as a closure is because in high performance scenarios
   * they are significantly faster than a method that is wrapped with `.bind()`.
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
    if (this.canRequestFrame()) {
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

  /**
   * Adds the given `fn` to be called on each frame if the
   * ticker is started.
   */
  public add(fn: ListenerFn): void {
    this.listeners.push(fn);
  }

}
