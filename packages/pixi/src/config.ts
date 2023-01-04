/** Configuration for the renderer bundle. */
export interface RendererConfig {

  /** Enables anti-aliasing if set to `true`. Enabled by default. */
  antiAlias?: boolean;

  /**
   * If set to a selector string that is valid for `document.querySelector()`, the
   * renderer will be automatically appended to the element matched with that selector
   * when the game is initialized.
   */
  appendTo?: string;

  /**
   * If set to `true` the renderer will be automatically resized to fit its parent
   * element.
   */
  autoResize?: boolean;

  /**
   * Unless [[transparent]] is set to `true` this color will fill the background of the
   * game stage. This will default to `0x0` (black).
   */
  background?: number;

  /**
   * If `true` the empty background of the renderers stage will not be filled in with
   * a solid color.
   */
  transparent?: boolean;

  /**
   * Multiplier for [[Transform]] component values. For example, when `unitSize` is `16`
   * and `Transform.x` is `2`, systems like`SpriteRenderer` will calculate a position on
   * the x axis as `32px` (16 * 2).
   */
  unitSize: number;

}

export class RendererConfig {

  constructor(public unitSize: number) {}

}

