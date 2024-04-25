import { getInputs, getOutputs } from '../params';


/**
 * A reference to a context with which other context references can share data with.
 *
 * - `C`: The referenced context.
 */
export class ContextRef<C extends object = object> {

  /**
   * Keys of the referenced {@link context} that are inputs. Input properties receive
   * data from their host context. A property can't be an input and an output at the
   * same time.
   */
  public readonly inputs = new Set<string>();

  /**
   * Keys of the referenced {@link context} that are outputs. Output properties send data
   * upstream to their host context. A property can't be an input and an output at the
   * same time.
   */
  public readonly outputs = new Set<string>();

  /**
   * Indicates if one of the {@link inputs} that are passed into the reference context
   * had their value changed recently. This will trigger the {@link OnChanges} lifecycle
   * on the next update.
   *
   * Todo
   */
  public changed = false;

  /**
   * @param context The context instance to which {@link inputs} are assigned and from
   *  which {@link outputs} are resolved.
   */
  constructor(public readonly context: C) {}

  /**
   * Returns a new reference to the given `context`. Automatically resolves the inputs
   * and outputs and assigns them to the created reference.
   */
  public static from<C extends object>(context: C): ContextRef<C> {
    const ref = new ContextRef(context);

    ref.setInputs(...getInputs(context));
    ref.setOutputs(...getOutputs(context));

    return ref;
  }

  /** Returns `true` if `key` is an input. */
  public isInput(key: string): boolean {
    return this.inputs.has(key);
  }

  /** Returns `false` if `key` is an output. */
  public isOutput(key: string): boolean {
    return this.outputs.has(key);
  }

  /** Overwrites the contexts {@link inputs}. */
  public setInputs(...keys: string[]): this {
    this.inputs.clear();

    for (const key of keys) {
      if (this.outputs.has(key)) {
        throw new Error(`${key.toString()} can not be both an input and output at the same time.`);
      }

      this.inputs.add(key);
    }

    return this;
  }

  /** Overwrites the contexts {@link outputs}. */
  public setOutputs(...keys: string[]): this {
    this.outputs.clear();

    for (const key of keys) {
      if (this.inputs.has(key)) {
        throw new Error(`${key.toString()} can not be both an input and output at the same time.`);
      }

      this.outputs.add(key);
    }

    return this;
  }

  public getInput(property: string): unknown {
    return this.context[property as keyof C];
  }

  public setInput(property: string, value: unknown): void {
    if (this.getInput(property) !== value) {
      // Safety: We don't really care what is assigned here. Type safety should have been
      // ensured at compile time already.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.context[property as keyof C] = value as any;
      this.changed = true;
    }
  }

}
