/**
 * Allows data sharing between the view references of {@link UiNode nodes}.
 *
 * If the entity that owns this context is not a top level node, it cannot be a top
 * level context.
 *
 * The context declares which data is shared between a local view reference `L` and a
 * parent view reference `P`, and in which direction it will flow. The parent view ref
 * is always the view reference of the parent context. Subsequently, if this context is
 * top-level, it can't share data up via {@link outputs}.
 *
 * The context hierarchy is not the same as the node hierarchy, as not all nodes capture
 * a context. The parent context is resolved automatically when this component is first
 * spawned into the world.
 *
 * - `L`: Local {@link ViewRef} type.
 * - `P`: Parent {@link ViewRef} type.
 */
export interface Context<L = unknown, P = unknown> {

  /**
   * Contains all keys of the local {@link ViewRef} `L` that are inputs.
   *
   * Inputs are keys of the local view reference `L` on which data is received from the
   * parent view reference `P`. The input requires a {@link bind relationship} to know
   * from where it should resolve data from. A key can't be an input and output at the
   * same time.
   */
  inputs: Set<keyof L>;

  /**
   * Contains all keys of the local {@link ViewRef} `L` that are inputs.
   *
   * Outputs are keys of the local view reference `L` that send their data to the parent
   * view reference `P`. The input requires a {@link bind relationship} to know where it
   * should send data to. A key can't be an input and output at the same time.
   */
  outputs: Set<keyof L>;

  /**
   * Shares data between a `local` and `parent` view reference.
   *
   * Context {@link inputs} will be resolved from the parent view reference and applied
   * to the local reference. Context {@link outputs} will be resolved from the local view
   * reference and applied to the parent reference.
   *
   * Only data is shared for keys that have a  {@link bindings relationship} defined
   * on this context.
   */
  apply(local: L, parent: P): this;

}

/**
 * - `L`: Local {@link ViewRef} type.
 * - `P`: Parent {@link ViewRef} type.
 */
export interface Binding<L = unknown, P = unknown> {
  resolve(context: Context<L, P>, source: L, target: P): void;
}