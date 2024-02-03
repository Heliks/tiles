import { Binding } from './binding';
import { ContextRef } from './context-ref';


/** @internal */
// Safety: The value returned here can truly be anything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/**
 * Dynamic reference between they key of a parent {@link ContextRef} and the key of a local
 * one.
 *
 * When this binding is resolved, the value is resolved from either the local or parent
 * view reference and passed into its counterpart. The direction in which this happens,
 * depends on whether the `local` key is an {@link Input} or a {@link Output}. If it is
 * the former, the value is copied from parent to local. If it is an output, it is the
 * other way around. If it's neither, no data will be shared between both of them.
 */
export class PassByReference implements Binding {

  /**
   * @param local Key of the local view reference `L`.
   * @param parent Key of the parent view reference `P`.
   */
  constructor(public readonly local: string, public readonly parent: string) {}

  /** @inheritDoc */
  public resolve(local: ContextRef, parent: ContextRef): void {
    if (local.isOutput(this.local)) {
      parent.setInput(this.parent, local.getInput(this.local));
    }
    else if (local.isInput(this.local)) {
      local.setInput(this.local, parent.getInput(this.parent));
    }
  }

}
