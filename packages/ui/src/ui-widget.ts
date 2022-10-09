import { RectangleBounds } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';


/** Implementation of an UI widget. */
export interface UiWidget {

  /**
   * If specified, this will be inherited by the {@link Widget} component. This is useful
   * for widgets that are interactive by default (a.E. buttons). The interaction can
   * still be disabled directly on the component.
   */
  readonly interactive?: boolean;

  /**
   * The widgets `Drawable`. This drawable must have rectangular boundaries.
   * @see Drawable
   * @see RectangleBounds
   */
  view: Drawable;

  /** Updates the widgets drawable (view). This is called once on each frame. */
  update(): void;

}
