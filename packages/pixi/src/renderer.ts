import * as PIXI from 'pixi.js';
import { Container, Graphics, IPoint, Renderer as PixiRenderer, Texture } from 'pixi.js';
import { AssetStorage } from '@tiles/assets';
import { Inject, Injectable } from '@tiles/injector';
import { RendererConfig, TK_RENDERER_CONFIG } from './config';
import { Stage } from './stage';
import { EventQueue, Vec2 } from "@tiles/engine";

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

  /**
   * A graphics layer that can be used to draw debugging information on. This layer is
   * cleared automatically on each frame and will be drawn on top of everything else.
   */
  public readonly debugDraw = new Graphics();

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /**
   * Returns the "up-scale" of the game stage to fit the [[resolution]] and size
   * of the renderer.
   */
  public get scale(): IPoint {
    return this.stage.scale;
  }

  /** Contains the renderers height in px. */
  public get height(): number {
    return this.renderer.view.height;
  }

  /** Contains the renderers width in px. */
  public get width(): number {
    return this.renderer.view.width;
  }

  /** Asset storage for loaded textures. */
  public readonly textures = new AssetStorage<Texture>();

  /**
   * If this contains `true` as value the render will always be resized
   * via [[resizeToParent()]] when the screen resolution changes.
   */
  protected autoResize = false;

  /** Screen resolution in px. */
  protected readonly resolution: Vec2 = [640, 488];

  /** PIXI.JS renderer. */
  protected readonly renderer: PixiRenderer;

  /**
   * Contains all render layers (stage, debug draw, etc..). This is the container that
   * contains the game, and will be rendered to the canvas element that can be added
   * to the DOM via [[appendTo()]].
   */
  protected readonly root = new Container();

  /**
   * @param config The renderers config.
   * @param stage The stage where everything is drawn.
   */
  constructor(
    @Inject(TK_RENDERER_CONFIG)
    public readonly config: RendererConfig,
    public readonly stage: Stage
  ) {
    // Listen to browser resize events.
    window.addEventListener('resize', this.onScreenResize.bind(this));

    // Initialize PIXI renderer.
    this.renderer = new PixiRenderer({
      antialias: config.antiAlias,
      transparent: config.transparent
    });

    // Prevent sub-pixel smoothing when anti aliasing is disabled.
    if (!config.antiAlias) {
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    }

    // Stage is always rendered first.
    stage.zIndex = 0;
    // Debug draw layer should be always on top.
    this.debugDraw.zIndex = 999;

    this.root.addChild(stage, this.debugDraw);
    this.root.sortChildren();
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

  /** Applies `width` and `height` to the renderer. */
  public resize(width: number, height: number): this {
    // Resize the renderers canvas element.
    this.renderer.resize(width, height);

    // Update the ratio by which the game stage has to be scaled to fit into the
    // new size of the canvas element.
    const ratio = width / this.resolution[0];

    this.stage.scale.set(ratio);

    // Push event to queue
    this.onResize.push({
      height,
      width,
      ratio,
      type: 'resize'
    });

    return this;
  }

  /**
   * Resizes the renderer to fit the width and height of the
   * the DOM element in which it is contained.
   */
  public resizeToParent(): this {
    const parent = this.renderer.view.parentElement;

    if (parent) {
      this.resize(parent.clientWidth, parent.clientHeight);
    }

    return this;
  }

  /**
   * Disables or enables auto-resizing of the renderer when the screen/viewport
   * resolution has changed.
   */
  public setAutoResize(value: boolean): this {
    this.autoResize = value;

    if (value) {
      this.resizeToParent();
    }

    return this;
  }

  /**
   * Event listener that is called every time the screen or viewport resolution
   * has changed.
   */
  protected onScreenResize(): void {
    if (this.autoResize) {
      this.resizeToParent();
    }
  }

  /** Appends the renderer as <canvas> element to the given target. */
  public appendTo(target: HTMLElement): this {
    target.appendChild(this.renderer.view);

    return this;
  }

  /** Updates the renderer. Should be called once on every frame. */
  public update(): void {
    this.renderer.render(this.root);
    this.debugDraw.clear();
  }

  /** Updates the resolution in which the game should be rendered. */
  public setResolution(width: number, height: number): this {
    this.resolution[0] = width;
    this.resolution[1] = height;

    if (this.autoResize) {
      this.resize(this.renderer.width, this.renderer.height);
    }
    else {
      this.resize(width, height);
    }

    return this;
  }

  /** Returns the current resolution in which the game is rendered. */
  public getResolution(): readonly [number, number] {
    return this.resolution;
  }

}
