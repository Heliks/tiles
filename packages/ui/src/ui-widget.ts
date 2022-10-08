import { RectangleBounds } from '@heliks/tiles-engine';
import { Drawable } from '@heliks/tiles-pixi';


/** Implementation of an UI widget. */
export interface UiWidget {

  /**
   * The widgets `Drawable`. This drawable must have rectangular boundaries.
   * @see Drawable
   * @see RectangleBounds
   */
  view: Drawable & RectangleBounds;

  /** Updates the widgets drawable (view). This is called once on each frame. */
  update(): void;

}
