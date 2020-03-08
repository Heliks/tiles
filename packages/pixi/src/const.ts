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
}
