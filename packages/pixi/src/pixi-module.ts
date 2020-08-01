import { ClassType, GameBuilder, Module, Provider } from '@tiles/engine';
import * as PIXI from 'pixi.js';
import { parseConfig, RENDERER_CONFIG_TOKEN, RENDERER_PLUGINS_TOKEN, RendererConfig } from './config';
import { Renderer } from './renderer';
import { RendererSystem } from './renderer-system';
import { SpriteAnimationSystem, SpriteDisplaySystem } from './sprite';
import { Stage } from './stage';
import { ShapeDisplaySystem } from './shape-display';
import { RendererPlugin } from './types';
import { Camera } from './camera';
import { ScreenDimensions } from './screen-dimensions';
import { DebugDraw } from './debug-draw';
import { SPRITE_SHEET_STORAGE } from './sprite-sheet';

/**
 * Module that provides a WebGL drawing context.
 *
 * It is recommended that this plugin is running as late in the execution order as
 * possible so that the visual representation of the game world is not one frame behind
 * of what is actually happening.
 */
export class PixiModule implements Module {

  /** Plugins added to the renderer. */
  protected plugins: ClassType<RendererPlugin>[] = [];

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: Partial<RendererConfig> = {}) {}

  /** Returns the `Provider` for all plugins that were added to the module. */
  private getPluginProvider(): Provider {
    return {
      singleton: true,
      token: RENDERER_PLUGINS_TOKEN,
      // Instantiate each plugin via service container.
      factory: container => this.plugins.map(
        plugin => container.make(plugin)
      )
    };
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    // Prevents the "Thanks for using PIXI" message from showing up in the console.
    PIXI.utils.skipHello();

    const config = parseConfig(this.config);

    // Provide the configuration before anything else.
    builder.provide({
      token: RENDERER_CONFIG_TOKEN,
      value: config
    });

    builder
      .provide({
        token: ScreenDimensions,
        value: new ScreenDimensions(
          0,
          0,
          config.resolution[0],
          config.resolution[1],
          config.unitSize
        )
      })
      .provide({
        token: SPRITE_SHEET_STORAGE,
        value: new Map()
      })
      .provide(Camera)
      .provide(DebugDraw)
      .provide(Stage)
      .provide(Renderer)
      // .provide(Camera)
      .provide(this.getPluginProvider())
      // Should run before the SpriteDisplaySystem so that sprites are updated on the same
      // frame where the animation possibly transformed them.
      .system(SpriteAnimationSystem)
      .system(SpriteDisplaySystem)
      .system(ShapeDisplaySystem)
      .system(RendererSystem);
  }

  /**
   * Adds a `plugin` to the renderer.
   *
   * Plugins can be used to add additional render passes to the game and is for example
   * useful for creating debug draw systems. Each plugin will be executed in the same
   * order as they were added.
   */
  public plugin(plugin: ClassType<RendererPlugin>): this {
    this.plugins.push(plugin);

    return this;
  }

}
