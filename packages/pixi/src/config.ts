export const TK_RENDERER_CONFIG = Symbol('Configuration for renderer module.');

export interface RendererConfig {
  /**
   * Enable or disable anti alias.
   */
  antiAlias: boolean;
  /**
   * If this is set to true the empty background of the renderers
   * stage will not be filled in with a solid color.
   */
  transparent: boolean;

  /**
   * Multiplier that will be applied to all values coming from the [[Transform]]
   * component. For example, if the `unitSize` is `16` and `Transform.x` is `2`,
   * systems like the `SpriteRenderer` will calculate the sprite position on the
   * x axis as `32px` (16 * 2).
   */
  unitSize: number;

}

/** Parses a partial `config` and adds fallback values. */
export function parseConfig(config: Partial<RendererConfig>): RendererConfig {
  return {
    antiAlias: true,
    transparent: false,
    unitSize: 0,
    ...config
  };
}
