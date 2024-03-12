import { Entity, World } from '@heliks/tiles-engine';
import { Style } from '../style';


/**
 * Given a composer of type `C`, this factory will spawn a hierarchy of node elements
 * into the world.
 */
export type TemplateFactory<C> = (compose: C) => unknown;

/** Implementations for modifying a {@link UiNode} component. */
export interface ComposeNode {

  /** Entity world in which the composed node exists. */
  readonly world: World;

  /**Owner of the {@link UiNode} component that is being composed.*/
  readonly entity: Entity;

  /** Attaches the given `component` the node owner. */
  use(component: object): this;

  /**
   * Inserts a new child node and returns a composer for it. The composer being returned
   * is the same type as the one from which it was called.
   */
  insert(): ComposeNode;

  /** Adds a new child node. */
  // Safety: Any type of template composer is allowed here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child(factory: TemplateFactory<any>): this;

  /** Modifies the nodes {@link style stylesheet}. */
  style(style: Partial<Style>): this;

  /** Allows the node to receive UI events. */
  listen(): this;

  /** Returns the entity that owns the composed node. */
  build(): Entity;

}

