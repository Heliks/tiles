import { AssetStorage } from '@heliks/tiles-assets';
import { EventQueue, Inject, Injectable, Struct } from '@heliks/tiles-engine';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from './config';
import { Stage } from './stage';
import { DebugDraw } from './debug-draw';
import { Camera } from './camera';
import { ScreenDimensions } from './screen-dimensions';
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
    // Fixme: figure out if this can be somehow set on the renderer as it currently forces
    //  two games running on the same page to use the same scale mode.
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    _config.antialias = false;
  }

  return new PIXI.Renderer(_config);
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
    public readonly dimensions: ScreenDimensions,
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
   * Resizes the renderer to fit the width and height of the
   * the DOM element in which it is contained.
   */
  public resizeToParent(): this {
    const parent = this.renderer.view.parentElement;

    if (parent) {
      this.dimensions.resize(parent.clientWidth, parent.clientHeight);
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

  /** Appends the renderer as <canvas> element to the given target. */
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
    const dim = this.dimensions;

    // Update the dimensions of the screen.
    if (dim.dirty) {
      // Resize the renderer and adjust the stage scale to fit into that new dimension.
      this.renderer.resize(dim.size.x, dim.size.y);
      this.stage.scale(dim.scale.x, dim.scale.y);

      // Also update the debug draw accordingly.
      this.debugDraw.resize(dim.size.x, dim.size.y).scale(dim.scale.x, dim.scale.y);

      this.onResize.push({
        height: dim.size.y,
        width: dim.size.x,
        ratio: dim.scale.y,
        type: 'resize'
      });

      dim.dirty = false;
    }

    // Update stage position according to the camera position and update the offset
    // in ScreenDimensions accordingly.
    this.stage.setPosition(
      dim.offset.x = this.camera.screen.x,
      dim.offset.y = this.camera.screen.y
    );

    this.stage.updateNodes();

    // Render the final image.
    this.renderer.render(this.root);
  }

}
