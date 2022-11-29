import { Bundle, ClassType, GameBuilder, hasOnInit, OnInit, Provider, Struct, World } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { Camera } from './camera';
import { DebugDraw } from './debug-draw';
import { Renderer } from './renderer';
import { RendererPlugin, RendererPlugins } from './renderer-plugins';
import { RendererSystem } from './renderer-system';
import { Screen } from './screen';
import { SpriteAnimation, SpriteAnimationSystem, SpriteRender, SpriteRenderer } from './sprite';
import { Overlay, Stage } from './stage';
import { Screenshot } from './screenshot';


/** Configuration for the renderer bundle. */
export interface RendererBundleConfig {

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
   * The resolution in which the game should be rendered. First index is width, second
   * is height in px.
   */
  resolution: [number, number];

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

/**
 * Bundle that provides a WebGL drawing context via PIXI.JS.
 *
 * To ensure that rendering does not appear out of sync it is recommended that the
 * renderer plugin runs as late as possible in the system execution order.
 */
export class PixiBundle implements Bundle, OnInit {

  /** Plugins added to the renderer. */
  private readonly plugins: ClassType<RendererPlugin>[] = [];

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: RendererBundleConfig) {}

  /**
   * Adds a `plugin`.
   *
   * Plugins essentially work like normal game systems, with the difference that they
   * are executed by the renderer instead of the system dispatcher. This ensures that
   * all rendering is done at the same time so that different rendering operations do
   * not appear out of sync.
   */
  public plugin(plugin: ClassType<RendererPlugin>): this {
    this.plugins.push(plugin);

    return this;
  }

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

  /** @internal */
  private createPIXIRenderer(): PIXI.Renderer {
    const config: Struct = {};

    if (this.config.transparent) {
      config.transparent = true;
    }
    else {
      // By default render the background as black.
      config.backgroundColor = this.config.background ?? 0x0;
    }

    if (config.antiAlias) {
      config.antialias = true;
    }
    else {
      // Prevent sub-pixel smoothing when anti aliasing is disabled.
      // Fixme: figure out if this can be somehow set on the renderer as it currently
      //  forces two games running on the same page to use the same scale mode.
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

      config.antialias = false;
    }

    const renderer = new PIXI.Renderer(config);

    // Disable context menu on the renderers <canvas> DOM element.
    renderer.view.addEventListener('contextmenu', e => e.preventDefault());

    return renderer;
  }

  /** @inheritDoc */
  public build(builder: GameBuilder): void {
    // Prevents the "Thanks for using PIXI" message from showing up in the console.
    PIXI.utils.skipHello();

    // Provide the PIXI renderer.
    builder.provide({
      token: PIXI.Renderer,
      value: this.createPIXIRenderer()
    });

    builder
      .component(SpriteAnimation)
      .component(SpriteRender)
      .provide({
        token: Screen,
        value: new Screen(
          this.config.resolution[0],
          this.config.resolution[1],
          this.config.resolution[0],
          this.config.resolution[1],
          this.config.unitSize
        )
      })
      .provide(this.getPluginProvider())
      .provide(Camera)
      .provide(DebugDraw)
      .provide(Stage)
      .provide(Overlay)
      .provide(Renderer)
      .provide(Screenshot)
      // Should run before the SpriteDisplaySystem so that sprites are updated on the
      // same frame where the animation possibly transformed them.
      .system(SpriteAnimationSystem)
      .system(SpriteRenderer)
      .system(RendererSystem);
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    const renderer = world.get(Renderer);

    if (this.config.appendTo) {
      const element = document.querySelector(this.config.appendTo);

      if (! element) {
        throw new Error(`Renderer stage target is undefined. Used selector: ${this.config.appendTo}`);
      }

      renderer.appendTo(element);
    }

    if (this.config.autoResize) {
      renderer.setAutoResize(true);
    }

    // Call onInit lifecycle on plugins as well.
    for (const plugin of world.get(RendererPlugins).items) {
      if (hasOnInit(plugin)) {
        plugin.onInit(world);
      }
    }
  }

}
