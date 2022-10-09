import { Drawable } from '@heliks/tiles-pixi';


/** Implementation of an UI widget. */
export interface UiWidget {

  /**
   * If specified, this will be inherited by the {@link Node} component. This is useful
   * for widgets that are interactive by default (a.E. buttons). The interaction can
   * still be disabled directly on the component.
   */
  readonly interactive?: boolean;

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
  update(): void;

}
