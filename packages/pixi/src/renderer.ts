import { Container as BaseContainer, Renderer as PixiRenderer, Texture } from 'pixi.js';
import { AssetStorage } from '@tiles/assets';
import { Inject, Injectable } from '@tiles/injector';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from './config';
import { Stage } from './stage';
import { EventQueue } from '@tiles/engine';
import { DebugDraw } from './debug-draw';
import { initPixi } from './utils';
import { Renderable } from './types';
import { Camera } from './camera';
import { ScreenDimensions } from './screen-dimensions';

/** A container that can contain many other [[Renderable]] objects. */
export class Container<T extends Renderable = Renderable> extends BaseContainer implements Renderable {

  /** @inheritDoc */
  public readonly children: T[] = [];

}

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

@Injectable()
export class Renderer {

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /** Asset storage for loaded textures. */
  public readonly textures: AssetStorage<Texture> = new Map();

  /**
   * If this contains `true` as value the render will always be resized via
   * [[resizeToParent()]] when the screen resolution changes.
   */
  protected autoResize = false;

  /** PIXI.JS renderer. */
  protected readonly renderer: PixiRenderer;

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
      const [ sx, sy ] = dim.scale;

      // Resize the renderer and adjust the stage scale to fit into that new dimension.
      this.renderer.resize(...dim.size);
      this.stage.scale(sx, sy);

      // Also update the debug draw accordingly.
      this.debugDraw.resize(dim.size[0], dim.size[1]).scale(sx, sy);

      this.onResize.push({
        height: dim.size[1],
        width: dim.size[0],
        ratio: dim.scale[0],
        type: 'resize'
      });

      dim.dirty = false;
    }

    // Update the position of the stage according to the current camera position.
    this.stage.setOffset(
      this.camera.sx,
      this.camera.sy
    );

    this.renderer.render(this.root);
  }

}
