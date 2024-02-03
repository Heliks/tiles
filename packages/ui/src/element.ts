import { Entity, World } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';
import { Node as LayoutNode, Rect, Size } from './layout';


/**
 * Implementation of a UI element.
 *
 * The element adds behavior to the {@link UiNode} to which it is attached to. Like HTML
 * elements, they define the available building blocks for higher level UI composition.
 *
 * Elements can implement the UI lifecycle.
 */
export interface Element<V extends object = object> {

  /**
   * Intrinsic size of the element.
   *
   * If set, the element will project this size onto the layout of the {@link Node} to
   * which it is attached to by overwriting its {@link StyleSheet style-sheet}.
   */
  readonly size?: Rect<Size>;

  /**
   * Contains the {@link Drawable} for this element, if defined.
   *
   * Views are optional, as not all elements require additional rendering. The view is
   * added to the stage automatically when this element is attached to an entity.
   */
  view?: Drawable;

  /**
   * Called once per frame as long as the {@link UiNode} component that owns this element
   * is attached to a living entity.
   */
  update(world: World, entity: Entity, layout: LayoutNode): void;

  /**
   * Returns the context used for the elements' {@link ContextRef} when it is spawned
   * into the world. In most cases, this is the element itself.
   */
  getContext(): V;

}
