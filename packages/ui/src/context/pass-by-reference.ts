import { Binding } from './binding';
import { ContextRef } from './context-ref';


/** @internal */
// Safety: The value returned here can truly be anything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/** Passes the value of a property on the host context into the local context. */
export class PassByReference implements Binding {

  /**
   * @param local Local context key.
   * @param host Host context key.
   */
  constructor(public readonly local: string, public readonly host: string) {}

  /** @inheritDoc */
  public resolve(local: ContextRef, host: ContextRef): void {
    local.setInput(this.local, host.getInput(this.host))
  }

}
