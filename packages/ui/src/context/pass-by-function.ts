import { Binding } from './binding';
import { ContextRef } from './context-ref';


/**
 * Callback for the {@link PassByFunction} binding. Will be called once per frame and
 * its return value will be injected into a local input.
 */
export type PassByFunctionCallback = () => unknown;

/**
 * This binding executes a function upon resolve and passes the return value of that
 * function into a local input.
 */
export class PassByFunction implements Binding {

  /**
   * @param local Name of the local input.
   * @param fn Function that produces the input value.
   */
  constructor(public readonly local: string, public readonly fn: PassByFunctionCallback) {}

  /** @inheritDoc */
  public resolve(local: ContextRef): void {
    local.setInput(this.local, this.fn());
  }

}
