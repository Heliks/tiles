import { ContextRef } from './context-ref';


/** Data-binding of a local {@link ContextRef}. */
export interface Binding {

  /**
   * @param local Local context reference.
   * @param host Reference of the host context, if any.
   */
  resolve(local: ContextRef, host?: ContextRef): void;

}
