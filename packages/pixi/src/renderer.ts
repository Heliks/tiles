import * as PIXI from 'pixi.js';
import { AssetStorage } from '@tiles/assets';
import { Inject, Injectable } from '@tiles/injector';
import { Renderer as PixiRenderer, Texture } from 'pixi.js';
import { RendererConfig, TK_RENDERER_CONFIG } from './const';
import { Stage } from './stage';
import {Vec2} from "@tiles/engine";

@Injectable()
export class Renderer {

  /**
   * If this contains `true` as value the render will always be resized
   * via [[resizeToParent()]] when the screen resolution changes.
   */
  public autoResize = false;

  /** Screen resolution in px. */
  protected readonly resolution: Vec2 = [640, 488];

  /** PIXI.JS renderer. */
  protected readonly renderer: PixiRenderer;

  /** Asset storage for loaded textures. */
  public readonly textures = new AssetStorage<Texture>();

  /**
   * @param config The renderers config.
   * @param stage The stage where everything is drawn.
   */
  constructor(
    @Inject(TK_RENDERER_CONFIG)
    protected readonly config: RendererConfig,
    protected readonly stage: Stage
  ) {
    // Listen to browser resize events.
    window.addEventListener('resize', this.onScreenResize.bind(this));

    // Initialize PIXI renderer.
    this.renderer = new PixiRenderer({
      antialias:    config.antiAlias,
      transparent:  config.transparent
    });

    // Prevent sub-pixel smoothing when anti aliasing is disabled.
    if (!config.antiAlias) {
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    }
  }

  /** Sets the renderers background color to the hex value of `color`. */
  public setBackgroundColor(color: number): this {
    this.renderer.backgroundColor = color;
    this.renderer.render(this.stage);

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
    this.stage.scale.set(ratio);

    return this;
  }

  /**
   * Resizes the renderer to fit the width and height of the
   * the DOM element in which it is contained.
   */
  public resizeToParent(): this {
    const parent = this.renderer.view.parentElement;

    if (parent) {
      this.resize(
        parent.offsetWidth,
        parent.offsetHeight
      );
    }

    return this;
  }

  /**
   * Disables or enables auto-resizing of the renderer when the screen/viewport
   * resolution has changed.
   */
  public setAutoResize(value: boolean): this {
    this.autoResize = value;

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
    this.renderer.render(this.stage);
  }

  /** Updates the resolution in which the game should be rendered. */
  public setResolution(width: number, height: number): this {
    this.resolution[0] = width;
    this.resolution[1] = height;

    this.resize(this.renderer.width, this.renderer.height);

    return this;
  }

  /** Returns the current resolution in which the game is rendered. */
  public getResolution(): readonly [number, number] {
    return this.resolution;
  }

}
