import { AssetStorage } from '@heliks/tiles-assets';
import { EventQueue, Inject, Injectable, Struct } from '@heliks/tiles-engine';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from './config';
import { Stage } from './stage';
import { DebugDraw } from './debug-draw';
import { Camera } from './camera';
import { Screen } from './screen';
import { Container } from './renderables';
import * as PIXI from 'pixi.js'

export interface OnResizeEvent {
  /** New width of the renderer. */
  height: number;
  /** New height of the renderer. */
  width: number;
  /** Event type */
  type: 'resize';
  /** The ratio by which the game stage was upscaled. */
  ratio: number;
}

/** Initializes a PIXI renderer from the `config`. */
function initPixi(config: RendererConfig): PIXI.Renderer {
  const _config: Struct = {
    transparent: config.transparent ?? true
  };

  if (config.transparent) {
    _config.transparent = true;
  }
  else {
    // By default render the background as black.
    _config.backgroundColor = config.background ?? 0x0;
  }

  if (config.antiAlias) {
    _config.antialias = true;
  }
  else {
    // Prevent sub-pixel smoothing when anti aliasing is disabled.
    // Fixme: figure out if this can be somehow set on the renderer as it currently
    //  forces two games running on the same page to use the same scale mode.
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    _config.antialias = false;
  }

  const renderer = new PIXI.Renderer(_config);

  // Disable context menu on the renderers <canvas> DOM element.
  renderer.view.addEventListener('contextmenu', e => e.preventDefault());

  return renderer;
}


@Injectable()
export class Renderer {

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /** Asset storage for loaded textures. */
  public readonly textures: AssetStorage<PIXI.Texture> = new Map();

  /**
   * If this contains `true` as value the render will always be resized via
   * [[resizeToParent()]] when the screen resolution changes.
   */
  protected autoResize = false;

  /** PIXI.JS renderer. */
  protected readonly renderer: PIXI.Renderer;
  protected readonly root = new Container();

  /** Contains the renderers height in px. */
  public get height(): number {
    return this.renderer.view.height;
  }

  /** Contains the renderers width in px. */
  public get width(): number {
    return this.renderer.view.width;
  }

  /**
   * @param camera [[Camera]].
   * @param config The renderers config.
   * @param debugDraw Can be used to draw debug information on the screen.
   * @param stage The stage where everything is drawn.
   * @param dimensions
   */
  constructor(
    public readonly camera: Camera,
    @Inject(RENDERER_CONFIG_TOKEN)
    public readonly config: RendererConfig,
    public readonly debugDraw: DebugDraw,
    public readonly dimensions: Screen,
    public readonly stage: Stage
  ) {
    // Listen to browser resize events.
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Initialize PIXI.JS
    this.renderer = initPixi(config);

    this.setAutoResize(config.autoResize)

    this.root.addChild(stage.view, this.debugDraw.view);
  }

  /** Sets the renderers background color to the hex value of `color`. */
  public setBackgroundColor(color: number): this {
    this.renderer.backgroundColor = color;

    return this;
  }

  /** Returns the hex value of the renderers background color. */
  public getBackgroundColor(): number {
    return this.renderer.backgroundColor;
  }

  /**
   * Resizes the renderers canvas to fit the DOM element in which it is contained. This
   * can fail if either no parent element can be resolved, or if the parent element has
   * dimensions smaller than 1x1px.
   */
  public resizeToParent(): this {
    const parent = this.renderer.view.parentElement;

    if (parent) {
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      // Only allow resizing if parent element is at least 1x1px big, because PIXI (or
      // rather WebGL) can not deal with smaller dimensions properly.
      if (w > 0 || h > 0) {
        this.dimensions.resize(w, h);
      }
      else {
        console.warn('Cannot resize. Parent must be at least 1x1px.');
        console.warn(`Parent dimensions: w: ${w} h: ${h}`);
      }
    }

    return this;
  }

  /** Disable or enable auto-resizing when viewport size has changed. */
  public setAutoResize(value: boolean): this {
    this.autoResize = value;

    // If it was enabled we have to resize as it is not guaranteed that the renderer
    // had the correct size before.
    if (value) {
      this.resizeToParent();
    }

    return this;
  }

  /** Event that is called when the viewport size has changed. */
  protected onWindowResize(): void {
    if (this.autoResize) {
      this.resizeToParent();
    }
  }

  /** Appends the renderer as <canvas> element to `target`. */
  public appendTo(target: HTMLElement): this {
    target.append(this.renderer.view);

    if (this.autoResize) {
      this.resizeToParent();
    }

    return this;
  }

  /**
   * Updates the renderer. Will be automatically called once on each frame by the
   * [[RendererSystem]].
   */
  public update(): void {
    const screen = this.dimensions;

    // Update the dimensions of the screen.
    if (screen.dirty) {
      // Resize the renderer and adjust the stage scale to fit into that new dimension.
      this.renderer.resize(screen.size.x, screen.size.y);

      // this.stage.scale(
      // dim.scale.x,
      // dim.scale.y
      // );

      // Also update the debug draw accordingly.
      this.debugDraw.resize(screen.size.x, screen.size.y).scale(screen.scale.x, screen.scale.y);

      this.onResize.push({
        height: screen.size.y,
        width: screen.size.x,
        ratio: screen.scale.y,
        type: 'resize'
      });

      screen.dirty = false;
    }

    if (this.camera.enabled) {
      // Convert camera position to pixels, and treat that position as it if were
      // relative to the screen center.
      // Todo: Should probably do this in the camera itself.
      this.stage.view.x = -(this.camera.world.x * this.stage.view.scale.x * screen.unitSize) + (screen.size.x / 2);
      this.stage.view.y = -(this.camera.world.y * this.stage.view.scale.y * screen.unitSize) + (screen.size.y / 2);

      // Scale stage according to camera.
      this.stage.scale(this.camera.zoom);
    }

    // Render the final image.
    this.renderer.render(this.root);
  }

}
