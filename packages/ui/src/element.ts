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
   * Returns the context target.
   *
   * If this element uses a {@link Context}, this will return the local instance type
   * to which the context applies data to. In most cases this is the element itself,
   * but some structural elements like {@link UiComponentRenderer} might want to defer
   * the context to somewhere else.
   *
   * This also means that the value returned here is also the value from which the
   * context {@link Input inputs} will be resolved.
   */
  getContextInstance(): object;

}
