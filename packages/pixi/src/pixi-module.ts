import { GameBuilder, Module } from '@tiles/engine';
import { RendererConfig, TK_RENDERER_CONFIG } from './const';
import { Renderer } from './renderer';
import { SpriteRenderer } from './sprite/sprite-renderer';
import { Stage } from './stage';
import * as PIXI from 'pixi.js';

export class PixiModule implements Module {

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: Partial<RendererConfig> = {}) {}

  /** Returns the full renderer config. */
  private getConfig(): RendererConfig {
    return {
      antiAlias: true,
      transparent: false,
      ...this.config
    };
  }

  /** {@inheritDoc} */
  public build(builder: GameBuilder): void {
    // Prevent the "Thanks for using PIXI" message from showing
    // up in the console.
    PIXI.utils.skipHello();

    // Provide the configuration with which the module was created.
    builder.provide({
      token: TK_RENDERER_CONFIG,
      value: this.getConfig()
    });

    builder
      .provide(Stage)
      .provide(Renderer)
      .system(SpriteRenderer);
  }

}
