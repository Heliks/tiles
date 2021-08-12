import { ClassType, GameBuilder, Module, Provider } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { parseConfig, RENDERER_CONFIG_TOKEN, RendererConfig } from './config';
import { Renderer } from './renderer';
import { RendererSystem } from './renderer-system';
import { SPRITE_SHEET_STORAGE, SpriteAnimationSystem, SpriteDisplaySystem, SpriteEventSystem } from './sprite';
import { Stage } from './stage';
import { Camera } from './camera';
import { Screen } from './screen';
import { DebugDraw } from './debug-draw';
import { RendererPlugin, RendererPlugins } from './renderer-plugins';

/**
 * Module that provides a WebGL drawing context.
 *
 * It is recommended that this plugin is running as late in the execution order as
 * possible so that the visual representation of the game world is not one frame behind
 * of what is actually happening.
 */
export class PixiModule implements Module {

  /** Plugins added to the renderer. */
  private readonly plugins: ClassType<RendererPlugin>[] = [];

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: Partial<RendererConfig> = {}) {}

  /** @internal */
  private getPluginProvider(): Provider {
    return {
      factory: container => {
        const plugins = new RendererPlugins();

        // Instantiate each registered plugin using the service container.
        for (const item of this.plugins) {
          plugins.add(container.make(item));
        }

        return plugins;
      },
      singleton: true,
      token: RendererPlugins
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
        token: Screen,
        value: new Screen(
          config.resolution[0],
          config.resolution[1],
          config.resolution[0],
          config.resolution[1],
          config.unitSize
        )
      })
      .provide({
        token: SPRITE_SHEET_STORAGE,
        value: new Map()
      })
      .provide(this.getPluginProvider())
      .provide(Camera)
      .provide(DebugDraw)
      .provide(Stage)
      .provide(Renderer)
      // Should run before the SpriteDisplaySystem so that sprites are updated on the
      // same frame where the animation possibly transformed them.
      .system(SpriteAnimationSystem)
      .system(SpriteDisplaySystem)
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
