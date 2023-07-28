import { Drawable } from '@heliks/tiles-pixi';
import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size } from './layout';


/** Implementation of an UI widget. */
export interface UiWidget {

  /**
   * If specified, this will be inherited by the {@link Node} component. This is useful
   * for widgets that are interactive by default (a.E. buttons). The interaction can
   * still be disabled directly on the component.
   */
  readonly interactive?: boolean;

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
  view: Drawable;

  /**
   * Updates the widget view. If this widget is attached to a {@link Node} component,
   * this will be called automatically once per frame until the entity holding that
   * component is destroyed.
   */
  update(world: World, entity: Entity): void;

}
