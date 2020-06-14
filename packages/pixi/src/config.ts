export const RENDERER_CONFIG_TOKEN = Symbol('Configuration for renderer module.');
export const RENDERER_PLUGINS_TOKEN = Symbol('Plugins for renderer module.');

/** Configuration for the renderer module. */
export interface RendererConfig {

  /** Enables anti-aliasing if set to `true`. Enabled by default. */
  antiAlias: boolean;

  /**
   * If set to `true` the renderer will be automatically resized to fit its parent
   * element.
   */
  autoResize: boolean;

  /**
   * Unless [[transparent]] is set to `true` this color will fill the background of the
   * game stage. This will default to `0x0` (black).
   */
  background: number;

  /**
   * The resolution in which the game should be rendered. First index is width, second
   * is height in px.
   */
  resolution: [number, number];

  /**
   * If `true` the empty background of the renderers stage will not be filled in with
   * a solid color.
   */
  transparent: boolean;

  /**
   * Multiplier for [[Transform]] component values. For example, when `unitSize` is `16`
   * and `Transform.x` is `2`, systems like`SpriteRenderer` will calculate a position on
   * the x axis as `32px` (16 * 2).
   */
  unitSize: number;

}

/** Parses a `Partial<RendererConfig>` and fills missing keys with fallback values. */
export function parseConfig(config: Partial<RendererConfig>): RendererConfig {
  return {
    antiAlias: true,
    autoResize: false,
    background: 0x0,
    resolution: [640, 480],
    transparent: false,
    unitSize: 1,
    ...config
  };
}

