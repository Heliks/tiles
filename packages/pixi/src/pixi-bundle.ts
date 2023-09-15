import { AppBuilder, AppSchedule, Bundle, OnInit, Screen, Struct, World } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { CameraBundle } from './camera';
import { RendererConfig } from './config';
import { DebugDraw } from './debug-draw';
import { Layers, SortChildren, Stage } from './layer';
import { Renderer } from './renderer';
import { Screenshot } from './screenshot';
import { SpriteAnimation, SpriteAnimationSystem, SpriteRender, SpriteRenderer, SpriteRenderSerializer } from './sprite';
import { UpdateRenderer } from './update-renderer';


/** @internal */
function checkScreenPresence(builder: AppBuilder): void {
  if (! builder.container.has(Screen)) {
    throw new Error('Renderer requires a "Screen" to be present.');
  }
}

export enum RendererSchedule {
  Update,
  Render
}

/** Bundle that provides a WebGL rendering context via the PIXI.js library. */
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
  public build(builder: AppBuilder): void {
    checkScreenPresence(builder);

    // Prevents the "Thanks for using PIXI" message from showing up in the console.
    PIXI.utils.skipHello();

    console.log(builder.schedule())

    builder
      .component(SpriteAnimation)
      .component(SpriteRender, new SpriteRenderSerializer())
      .provide(RendererConfig, this.config)
      .provide(PIXI.Renderer, this.createPIXIRenderer())
      .bundle(new CameraBundle())
      .provide(DebugDraw)
      .provide(Layers)
      .provide(Stage)
      .provide(Renderer)
      .provide(Screenshot)
      .schedule()
        .after(RendererSchedule.Update, AppSchedule.PostUpdate)
      .schedule()
        .after(RendererSchedule.Render, RendererSchedule.Update)
      .system(SortChildren)
      .system(SpriteAnimationSystem, RendererSchedule.Update)
      .system(SpriteRenderer, RendererSchedule.Update)
      .system(UpdateRenderer, RendererSchedule.Render);
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
