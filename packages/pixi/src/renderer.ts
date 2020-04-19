import * as PIXI from 'pixi.js';
import { Renderer as PixiRenderer, Texture, Container, Graphics } from 'pixi.js';
import { AssetStorage } from '@tiles/assets';
import { Inject, Injectable } from '@tiles/injector';
import { RendererConfig, TK_RENDERER_CONFIG } from './config';
import { Stage } from './stage';
import { ReadVec2, Vec2 } from "@tiles/engine";

@Injectable()
export class Renderer {

  /**
   * If this contains `true` as value the render will always be resized
   * via [[resizeToParent()]] when the screen resolution changes.
   */
  public autoResize = false;

  /**
   * A graphics layer that can be used to draw debugging information on. This layer is
   * cleared automatically on each frame and will be drawn on top of everything else.
   */
  public readonly debugDraw = new Graphics();

  /**
   * Contains the scale factor of everything that is rendered. This is applied internally
   * to stretch everything to the size that is supposed to be. For example if the game
   * is rendered in a resolution of `[250, 150]`, but is rendered (or "up-scaled") to
   * a resolution of `[500, 225]` the scale would be `[2, 1.5]`.
   */
  public get scale(): ReadVec2 {
    return [
      this.root.scale.x,
      this.root.scale.y
    ]
  }

  /** Asset storage for loaded textures. */
  public readonly textures = new AssetStorage<Texture>();

  /** Screen resolution in px. */
  protected readonly resolution: Vec2 = [640, 488];

  /** PIXI.JS renderer. */
  protected readonly renderer: PixiRenderer;

  /**
   * Contains all render layers (stage, debug draw, etc..). This is the container
   * that will be rendered to the canvas element.
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
    const ratio = width / this.resolution[0];

    this.renderer.resize(width, height);
    this.root.scale.set(ratio);

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
