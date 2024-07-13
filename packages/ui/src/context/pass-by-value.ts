import { Binding } from './binding';
import { ContextRef } from './context-ref';


/** Passes a static value into the local context. */
export class PassByValue implements Binding {

  /**
   * @param local Local context key.
   * @param value Value to inject into the {@link local} context.
   */
  constructor(public readonly local: string, public readonly value: unknown) {}

  /** @inheritDoc */
  public resolve(local: ContextRef): void {
    if (local.isInput(this.local)) {
      local.setInput(this.local, this.value);
    }
  }

}
