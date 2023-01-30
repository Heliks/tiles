import { Bundle, GameBuilder, OnInit, Screen, Struct, World } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { Camera } from './camera';
import { DebugDraw } from './debug-draw';
import { Renderer } from './renderer';
import { SpriteAnimation, SpriteRender, SpriteRenderSerializer } from './sprite';
import { Screenshot } from './screenshot';
import { RendererConfig } from './config';
import { Layers, Stage } from './layer';


/** @internal */
function checkScreenPresence(builder: GameBuilder): void {
  if (! builder.container.has(Screen)) {
    throw new Error('Renderer requires a "Screen" to be present.');
  }
}

/**
 * Bundle that provides utilities for the PIXI.js renderer.
 *
 * On its own, this only provides services and resources for the renderer, but does not
 * render a stage on its own. For this, there is a separate {@link RendererHierarchy}
 * bundle that has to be added to the game builder.
 */
export class PixiBundle implements Bundle, OnInit {

  /**
   * @param config Renderer configuration.
   */
  constructor(public readonly config: RendererConfig) {}

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
    checkScreenPresence(builder);

    // Prevents the "Thanks for using PIXI" message from showing up in the console.
    PIXI.utils.skipHello();

    builder
      .component(SpriteAnimation)
      .component(SpriteRender, new SpriteRenderSerializer())
      .provide({
        token: RendererConfig,
        value: this.config
      })
      .provide({
        token: PIXI.Renderer,
        value: this.createPIXIRenderer()
      })
      .provide(Camera)
      .provide(DebugDraw)
      .provide(Layers)
      .provide(Stage)
      .provide(Renderer)
      .provide(Screenshot);
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
  }

}
