import { Entity, World } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';
import { Node as LayoutNode, Rect, Size } from './layout';


/**
 * An object that is a view reference.
 *
 * View references are the instances that a node {@link Context} applies data to. In
 * most cases, this is the nodes {@link Element} itself. Some structural elements like
 * {@link UiComponentRenderer} however, might want to defer the view reference to
 * somewhere else. Consequently, this is also the object from which the nodes own
 * context will resolve data from.
 */
export type ViewRef = object;

/**
 * Implementation of a UI element.
 *
 * The element adds behavior to the {@link UiNode} to which it is attached to. Like HTML
 * elements, they define the available building blocks for higher level UI composition.
 *
 * Elements can implement the UI lifecycle.
 */
export interface Element {

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
   * Returns the view reference.
   *
   * In most cases, this is a reference to the element itself. Some structural elements
   * like {@link UiComponentRenderer} however, will defer it to somewhere else.
   */
  getViewRef(): ViewRef;

}
