import { Context } from './context';
import { Binding } from './types';


/** @internal */
// Safety: The value returned here can truly be anything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/**
 * Dynamic reference between they key of a parent {@link ViewRef} and the key of a local
 * one.
 *
 * When this binding is resolved, the value is resolved from either the local or parent
 * view reference and passed into its counterpart. The direction in which this happens,
 * depends on whether the `local` key is an {@link Input} or a {@link Output}. If it is
 * the former, the value is copied from parent to local. If it is an output, it is the
 * other way around. If it's neither, no data will be shared between both of them.
 *
 * - `L`: Local {@link ViewRef} type.
 * - `P`: Parent {@link ViewRef} type.
 */
export class PassByReference<L = unknown, P = unknown> implements Binding<L, P> {

  /**
   * @param local Key of the local view reference `L`.
   * @param parent Key of the parent view reference `P`.
   */
  constructor(public readonly local: keyof L, public readonly parent: keyof P) {}

  /** @inheritDoc */
  public resolve(context: Context<L, P>, local: L, parent: P): void {
    if (context.outputs.has(this.local)) {
      parent[this.parent] = resolve(local, this.local);
    }
    else if (context.inputs.has(this.local)) {
      local[this.local] = resolve(parent, this.parent);
    }
  }

}