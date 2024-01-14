import { Entity, World } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';
import { Node as LayoutNode, Rect, Size } from './layout';


/** Implementation of an UI widget. */
export interface UiWidget {

  /**
   * Intrinsic size of the widget.
   *
   * If set, the widget will project this size onto the layout of the {@link Node} to
   * which it is attached to by overwriting its {@link StyleSheet style-sheet}.
   */
  readonly size?: Rect<Size>;

  /**
   * Contains the {@link Drawable} for this widget.
   *
   * Will be added to the stage automatically where appropriate.
   */
  view?: Drawable;

  /**
   * If this element uses a {@link Context}, this will return the local instance type
   * to which the context applies data to. In most cases this is the element itself,
   * but some structural elements like {@link UiComponentRenderer} might want to defer
   * the context to somewhere else.
   *
   * This also means that the value returned here is also the value from which the
   * context {@link Input inputs} will be resolved.
   */
  getContextInstance(): object;

  /** Called when this widget is attached to a {@link UiNode}. */
  onInit?(world: World, entity: Entity): void;

  /** Called when this widget is no longer attached to an entity. */
  onDestroy?(world: World, entity: Entity): void;

  /**
   * Updates the widget view. If this widget is attached to a {@link Node} component,
   * this will be called automatically once per frame until the entity holding that
   * component is destroyed.
   */
  update(world: World, entity: Entity, layout: LayoutNode): void;

}
