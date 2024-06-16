import { getInputs } from '../input';
import { ValueChanges } from '../lifecycle';


/**
 * Reference to a context with which other context references can share data with.
 *
 * - `C`: The referenced context.
 */
export class ContextRef<C extends object = object> {

  /**
   * Indicates if one of the data-bound properties on the referenced context had their
   * value changed since the last invocation of the {@link OnInit} lifecycle.
   */
  public changed = false;

  /**
   * Tracks changes to data-bound properties on the referenced context since its last
   * invocation of the {@link OnInit} lifecycle. {@link track Tracking} must be enabled
   * on this reference.
   */
  public changes: ValueChanges<C> = {};

  /**
   * Keys of the referenced {@link context} that are inputs. Input properties receive
   * data from their host context.
   */
  public readonly inputs = new Set<string>();

  /**
   * If set to `true`, changes to data-bound properties (e.g. inputs) on the referenced
   * context will be tracked at {@link changes} and passed into its {@link OnInit}
   * lifecycle.
   */
  public track = false;

  /**
   * @param context Referenced context.
   */
  constructor(public readonly context: C) {}

  /** Returns a new reference to the given `context`. */
  public static from<C extends object>(context: C): ContextRef<C> {
    const ref = new ContextRef(context);

    ref.setInputs(...getInputs(context));

    return ref;
  }

  /** Returns `true` if `key` is an input. */
  public isInput(key: string): boolean {
    return this.inputs.has(key);
  }

  /** Overwrites the contexts {@link inputs}. */
  public setInputs(...keys: string[]): this {
    this.inputs.clear();

    for (const key of keys) {
      this.inputs.add(key);
    }

    return this;
  }

  public getInput(property: string): unknown {
    return this.context[property as keyof C];
  }

  public setInput(property: string, value: unknown): void {
    const previous = this.getInput(property);

    if (previous !== value) {
      // Safety: We don't really care what is assigned here. Type safety should be
      // ensured at compile time.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.context[property as keyof C] = value as any;

      if (this.track) {
        this.changed = true;
        this.changes[property as keyof C] = {
          current: value,
          previous
        };
      }
    }
  }

}
