import { AppBuilder, AppSchedule, Bundle, OnInit, Screen, World } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { CameraBundle } from './camera';
import { RendererConfig } from './config';
import { DebugDraw } from './debug-draw';
import { Layers, SortChildren, Stage } from './layer';
import { Renderer } from './renderer';
import { Screenshot } from './screenshot';
import { SpriteAnimation, SpriteAnimationSystem, SpriteRender, SpriteRenderer } from './sprite';
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

/** Configuration for the renderer bundle. */
export interface RendererBundleOptions {

  /**
   * Enables or disables antialiasing.
   */
  antiAlias?: boolean;

  /**
   * Enables or disables auto-resizing.
   *
   * When enabled, the renderer will automatically resize the canvas element to fit
   * its parent element. This causes the entire game scene to be scaled to match the
   * games' resolution.
   */
  autoResize?: boolean;

  /**
   * Background color of the game stage.
   */
  background?: number;

  /**
   * Defines the layer hierarchy used by the renderer.
   *
   * In most cases each game that is being developed wants to define its own layer
   * hierarchy to specifically fit its needs. If no custom hierarchy is defined, the
   * renderer will put everything on a single layer.
   */
  layers?: (layers: Layers) => void;

  /**
   * Selector for the renderer canvas.
   *
   * The renderer will automatically append the canvas to the element matched by this
   * selector when the game is initialized.
   *
   * Must be a valid input for `document.querySelector()`.
   */
  selector: string;

  /**
   * The unit size tells the renderer how many pixels are equivalent to one game unit.
   *
   * When working with a non-pixel based physics engine, it's highly recommended to use
   * a unit size to translate between an arbitrary unit and pixels. The renderer will
   * apply this unit size to all transform values to translate that unit back to pixels
   * for rendering.
   *
   * For example, given a unit size of `16`, an entity at the world position x:5 / y:5
   * will be rendered on the screen at the position x:80px / y:80px.
   */
  unitSize?: number;

}

/** Bundle that provides a 2D rendering pipeline via the PIXI.js library. */
export class PixiBundle implements Bundle, OnInit {

  constructor(public readonly config: RendererBundleOptions) {}

  /** @internal */
  private createPIXIRenderer(): PIXI.Renderer {
    const antialias = Boolean(this.config.antiAlias);

    if (! antialias) {
      // Prevent sub-pixel smoothing when anti aliasing is disabled.
      // Fixme: figure out if this can be somehow set on the renderer as it currently
      //  forces two games running on the same page to use the same scale mode.
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    }

    const renderer = new PIXI.Renderer({
      antialias,
      backgroundColor: this.config.background ?? 0x0
    });

    // Disable context menu on the renderers <canvas> DOM element.
    renderer.view.addEventListener('contextmenu', e => e.preventDefault());

    return renderer;
  }

  /** @internal */
  private getRendererLayers(): Layers {
    const layers = new Layers();

    if (this.config.layers) {
      this.config.layers(layers);
    }
    else {
      layers.add('default');
    }

    return layers;
  }

  /** @inheritDoc */
  public build(app: AppBuilder): void {
    checkScreenPresence(app);

    // Prevents the "Thanks for using PIXI" message from showing up in the console.
    PIXI.utils.skipHello();

    app
      .component(SpriteAnimation)
      .component(SpriteRender)
      .schedule().after(RendererSchedule.Update, AppSchedule.PostUpdate)
      .schedule().after(RendererSchedule.Render, RendererSchedule.Update)
      .provide(Layers, this.getRendererLayers())
      .provide(RendererConfig, new RendererConfig(this.config.unitSize ?? 1))
      .provide(PIXI.Renderer, this.createPIXIRenderer())
      .bundle(new CameraBundle())
      .provide(DebugDraw)
      .provide(Stage)
      .provide(Renderer)
      .provide(Screenshot)
      .system(SortChildren)
      .system(SpriteAnimationSystem, RendererSchedule.Update)
      .system(SpriteRenderer, RendererSchedule.Update)
      .system(UpdateRenderer, RendererSchedule.Render);
  }

  /** @inheritDoc */
  public onInit(world: World): void {
    const renderer = world.get(Renderer);
    const element = document.querySelector(this.config.selector);

    if (! element) {
      throw new Error(`Renderer stage target is undefined. Used selector: ${this.config.selector}`);
    }

    renderer.appendTo(element);
    renderer.setAutoResize(this.config.autoResize ?? true);

    // Allows the PixiJS debug tools to capture the application.
    /* eslint-disable */
    (window as any).__PIXI_STAGE__ = renderer.root;
    (window as any).__PIXI_RENDERER__ = renderer.renderer;
    /* eslint-enable */
  }

}
