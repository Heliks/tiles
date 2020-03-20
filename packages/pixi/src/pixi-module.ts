import { GameBuilder, Module } from '@tiles/engine';
import * as PIXI from 'pixi.js';
import { parseConfig, RendererConfig, TK_RENDERER_CONFIG } from './config';
import { Renderer } from './renderer';
import { RendererSystem } from './renderer-system';
import { SpriteAnimationSystem, SpriteDisplaySystem } from './sprite';
import { Stage } from './stage';

export class PixiModule implements Module {

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: Partial<RendererConfig> = {}) {}

  /** {@inheritDoc} */
  public build(builder: GameBuilder): void {
    // Prevent the "Thanks for using PIXI" message from showing
    // up in the console.
    PIXI.utils.skipHello();

    // Provide the configuration with which the module was created.
    builder.provide({
      token: TK_RENDERER_CONFIG,
      value: parseConfig(this.config)
    });

    builder
      .provide(Stage)
      .provide(Renderer)
      .system(RendererSystem)
      // Should run before the SpriteDisplaySystem so that sprites are updated
      // on the same frame where the animation possibly transformed them.
      .system(SpriteAnimationSystem)
      .system(SpriteDisplaySystem);
  }

}
