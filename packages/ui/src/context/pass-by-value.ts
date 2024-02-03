import { Binding } from './binding';
import { ContextRef } from './context-ref';


/**
 * Passes a fixed value into the local view ref.
 */
export class PassByValue implements Binding {

  /**
   * @param local Key of the local view ref `L` into which {@link value} is injected.
   * @param value Value to inject into the {@link local} view ref.
   */
  constructor(public readonly local: string, public readonly value: unknown) {}

  /** @inheritDoc */
  public resolve(local: ContextRef): void {
    if (local.isInput(this.local)) {
      local.setInput(this.local, this.value);
    }
  }

}
