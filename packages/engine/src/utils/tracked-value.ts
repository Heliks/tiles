/**
 * Wrapper around a value type `T` that keeps track of changes to that value.
 *
 * Note: If `T` is a reference (e.g. object, array) and a property of that reference is
 * modified, the change needs to be propagated manually.
 */
export class TrackedValue<T> {

  /** Indicates if the value has changed since it has last been read. */
  public dirty = false;

  /**
   * @param value Value that is being wrapped. This should not be updated directly or
   *  changes to the value might be lost and can no longer be {@link read}.
   */
  constructor(public value: T) {}

  /** Updates the value. This will mark the value as changed. */
  public set(value: T): this {
    this.value = value;
    this.dirty = true;

    return this;
  }

  /**
   * Returns the value if it was changed before the last read. If a value is returned,
   * it will be marked as read in the process.
   */
  public read(): T | undefined {
    if (this.dirty) {
      this.dirty = false;

      return this.value;
    }
  }

}
