import { Binding } from './binding';
import { ContextRef } from './context-ref';
import { ObjectPath, resolveObjectPath } from './utils';


/** @internal */
// Safety: The value returned here can truly be anything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolve<T>(target: T, key: keyof T): any {
  return target[key];
}

/** Passes the value from the host context into the local context. */
export class PassByReference implements Binding {

  /**
   * @param local Name of the local input.
   * @param host Object path to resolve on the host context.
   */
  constructor(public readonly local: string, public readonly host: ObjectPath) {}

  /** @inheritDoc */
  public resolve(local: ContextRef, host: ContextRef): void {
    local.setInput(this.local, resolveObjectPath(host.context, this.host));
  }

}
