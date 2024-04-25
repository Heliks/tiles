import { Binding } from './binding';
import { ContextRef } from './context-ref';


/** @internal */
// Safety: The value returned here can truly be anything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/**
 * Reference between a local {@link ContextRef context} key and the key of its host.
 *
 * The value is either passed from the local reference into its parent or the other way
 * around. The direction in which this happens, depends on whether the `local` key is
 * an {@link Input} or an {@link Output}. For inputs, the value is copied from the host
 * context into the local context. For outputs, it is the other way around. If it's
 * neither, no data will be shared between them.
 */
export class PassByReference implements Binding {

  /**
   * @param local Local context key.
   * @param host Host context key.
   */
  constructor(public readonly local: string, public readonly host: string) {}

  /** @inheritDoc */
  public resolve(local: ContextRef, host: ContextRef): void {
    if (local.isOutput(this.local)) {
      host.setInput(this.host, local.getInput(this.local));
    }
    else if (local.isInput(this.local)) {
      local.setInput(this.local, host.getInput(this.host));
    }
  }

}
