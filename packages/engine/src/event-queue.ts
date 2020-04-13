export interface Subscriber {
  pointer: number;
}

export class EventQueue<T = unknown> {

  /** Contains all queued events. */
  protected queue: T[] = [];

  /** Contains all subscribers that were registered for this queue. */
  protected subscribers: Subscriber[] = [];

  /** Returns the total amount of items currently in the queue. */
  get size(): number {
    return this.queue.length;
  }

  /** Returns all events that are currently in the queue. */
  public getQueue(): readonly T[] {
    return this.queue;
  }

  /** Adds an event to the end of the queue. */
  public send(event: T): void {
    this.queue.push(event);
  }

  /**
   * Returns a `Subscriber` handle that is used to read from the queue. All subscriptions
   * their events or otherwise they will grow the event queue indefinitely.
   */
  public subscribe(): Subscriber {
    const subscriber = {
      pointer: this.queue.length
    };

    this.subscribers.push(subscriber);

    return subscriber;
  }

  /**
   * Shrinks the event queue down to the lowest possible size. Under most normal
   * circumstances this happens automatically after an event is consumed.
   */
  public shrink(): void {
    // Determine by how much we need to shrink the queue by finding the event
    // subscriber with the lowest possible pointer.
    const shrinkBy = Math.min(...this.subscribers.map(item => item.pointer));

    this.queue.splice(0, shrinkBy);

    // Shrink pointers also.
    for (const item of this.subscribers) {
      item.pointer -= shrinkBy;
    }
  }

  /**
   * Returns an iterator that iterates over all un-consumed events of the given
   * `subscriber`. Automatically shrinks the queue afterwards.
   *
   * ```typescript
   * const events = new EventQueue<number>();
   *
   * queue.send(1);
   *
   * const subscription = queue.subscribe();
   *
   * queue.send(2);
   * queue.send(3);
   *
   * for (const event of events.read(subscription)) {
   *     console.log(event);
   * }
   * ```
   *
   * Will produce
   *
   * ```bash
   * $ 2
   * $ 3
   * ```
   */
  public *read(subscriber: Subscriber): IterableIterator<T> {
    for (let l = this.queue.length; subscriber.pointer < l; subscriber.pointer++) {
      yield this.queue[ subscriber.pointer ];
    }

    // Automatically shrink the queue.
    this.shrink();
  }

  /**
   * Consumes the next event in the queue for the given subscriber. The queue is
   * shrunk afterwards if possible.
   *
   * ```typescript
   * const events = new EventQueue<string>();
   * const subscriber = events.subscribe();
   *
   * events.send('foo');
   * events.send('bar');
   *
   * console.log(events.next(subscriber)); // "foo"
   * console.log(events.next(subscriber)); // "bar"
   * ```
   *
   * Subscribers can only consume events that were send to the queue *after*
   * they subscribed to the queue:
   *
   * ```typescript
   * const events = new EventQueue<string>();
   *
   * events.send('foo');
   *
   * const sub = events.subscribe();
   *
   * events.send('bar');
   *
   * // "bar" because "foo" was added to the queue before we subscribed.
   * console.log(events.next(sub));
   * ```
   */
  public next(subsciber: Subscriber): T | undefined {
    const item = this.queue[ subsciber.pointer ];

    subsciber.pointer += 1;

    // Make space by removing already consumed events.
    this.shrink();

    return item;
  }

  /** Completely empties the queue and resets all [[subscribers]]. */
  public clear(): this {
    for (const item of this.subscribers) {
      item.pointer = 0;
    }

    this.queue.length = 0;

    return this;
  }

}
