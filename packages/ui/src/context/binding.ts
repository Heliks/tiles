import { ContextRef } from './context-ref';


/**
 * Bindings are relationships between an elements' context reference and the reference of
 * its {@link Host}. They are used to share data between them.
 */
export interface Binding {

  /**
   * Resolves the binding.
   *
   * @param contextRef The local context reference.
   * @param hostRef The local contexts' host reference.
   */
  resolve(contextRef: ContextRef, hostRef: ContextRef): void;

}
