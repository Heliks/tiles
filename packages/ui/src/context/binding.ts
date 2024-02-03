import { ContextRef } from './context-ref';


/** Describes a relationship between a context and its host. */
export interface Binding {

  /**
   * Resolves the binding.
   *
   * @param contextRef The local context reference.
   * @param hostRef The local contexts' host reference.
   */
  resolve(contextRef: ContextRef, hostRef: ContextRef): void;

}
