import { Node as LayoutNode, Rect, Size } from '@heliks/flex';
import { Entity, World } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';


/**
 * UI {@link Element elements} that implement this interface will be post-processed
 * after all UI systems are finished with the current frame, but before they are
 * passed into the renderer schedule. While most elements influence the layout, some
 * may want to act on the fully calculated layout (a.E.: stretching across the entire
 * background, etc.). This is where this logic can be implemented.
 */
export interface Postprocess {

  /** Callback that is invoked after all UI and layout calculations are done. */
  postprocess(world: World, entity: Entity, layout: LayoutNode): void;

}

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
   * If defined, returns the context used for the elements' {@link ContextRef} when it
   * is spawned into the world. By default, the element itself is used as context.
   */
  getContext?(): V;

}
