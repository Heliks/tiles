import { getInputs } from '../params';


/**
 * Reference to a context with which other context references can share data with.
 *
 * - `C`: The referenced context.
 */
export class ContextRef<C extends object = object> {

  /**
   * Keys of the referenced {@link context} that are inputs. Input properties receive
   * data from their host context.
   */
  public readonly inputs = new Set<string>();

  /**
   * Indicates if one of the {@link inputs} that are passed into the reference context
   * had their value changed recently.
   */
  public changed = false;

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
    if (this.getInput(property) !== value) {
      // Safety: We don't really care what is assigned here. Type safety should be
      // ensured at compile time.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.context[property as keyof C] = value as any;
      this.changed = true;
    }
  }

}
