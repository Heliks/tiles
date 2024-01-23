import { Binding, Context } from './types';


/**
 * Passes a fixed value into the local view ref.
 *
 * - `L`: Local {@link ViewRef} type.
 * - `P`: Parent {@link ViewRef} type.
 */
export class PassByValue<L = unknown, P = unknown> implements Binding<L, P> {

  /**
   * @param local Key of the local view ref `L` into which {@link value} is injected.
   * @param value Value to inject into the {@link local} view ref.
   */
  constructor(public readonly local: keyof L, public readonly value: any) {}

  /** @inheritDoc */
  public resolve(context: Context<L, P>, local: L): void {
    if (! context.inputs.has(this.local)) {
      throw new Error('Values can only be passed into @Input() bindings.');
    }

    local[this.local] = this.value;
  }

}