import { Binding } from './types';

/** Resolves the bound value. */
export class ValueBinding<T = unknown> implements Binding<T> {

  /**
     * @param value The bound value.
     */
  constructor(protected value: T) {}

  /**
     * Returns the bound value.
     *
     * @returns The bound value.
     */
  public resolve(): T {
    return this.value;
  }

}
