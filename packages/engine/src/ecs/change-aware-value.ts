/**
 * Wrapper around a value type `T` that keeps track of changes to that value.
 *
 * Note: If `T` is a reference (e.g. object, array) and a property of that reference is
 * modified, the change needs to be propagated manually.
 */
export class ChangeAwareValue<T> {

  /**
   * Indicates if the value was recently changed.
   *
   * @see read
   */
  public dirty = false;

  /**
   * The wrapped value.
   *
   * Note: If this is updated directly we are not aware of any changes, hence the dirty
   * flag will not be set. Use `set()` to update the value.
   */
  public value: T;

  /**
   * @param value Initial value.
   */
  constructor(value: T) {
    this.value = value;
  }

  /**
   * Updates the current value.
   *
   * This will mark the value as `dirty`, which means that the value was recently
   * changed. The dirty flag can be consumed via the `consume()` function.
   *
   * @see read
   */
  public set(value: T): this {
    this.value = value;
    this.dirty = true;

    return this;
  }

  /**
   * Reads the value. Returns the value if it is marked as dirty.
   *
   * The dirty flag will be removed in the process.
   */
  public read(): T | undefined {
    if (this.dirty) {
      this.dirty = false;

      return this.value;
    }
  }

}
