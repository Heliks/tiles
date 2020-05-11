import { Container, Renderer as PixiRenderer, Texture } from 'pixi.js';
import { AssetStorage } from '@tiles/assets';
import { Inject, Injectable } from '@tiles/injector';
import { RENDERER_CONFIG_TOKEN, RendererConfig } from './config';
import { Stage } from './stage';
import { EventQueue, Vec2, World } from "@tiles/engine";
import { DebugDraw } from "./debug-draw";
import { initPixi } from "./utils";

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

  /** Can be used to draw debug information on the screen. */
  public readonly debugDraw = new DebugDraw();

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /** Asset storage for loaded textures. */
  public readonly textures = new AssetStorage<Texture>();

  /**
   * The value by which positions coming from a `Transform` component should be
   * multiplied, as those value will be in a unit like meter while the renderer
   * works with pixels.
   */
  public unitSize = 1;

  /** Contains the renderers height in px. */
  public get height(): number {
    return this.renderer.view.height;
  }

  /** Contains the renderers width in px. */
  public get width(): number {
    return this.renderer.view.width;
  }

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
    @Inject(RENDERER_CONFIG_TOKEN) config: RendererConfig,
    public readonly stage: Stage,
  ) {
    // Listen to browser resize events.
    window.addEventListener('resize', this.onScreenResize.bind(this));

    // Initialize PIXI.JS
    this.renderer = initPixi(config);
    this.unitSize = config.unitSize;

    this.root.addChild(stage, this.debugDraw.view);
    this.root.sortChildren();

    this
      .setResolution(config.resolution[0], config.resolution[1])
      .setAutoResize(config.autoResize)
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
    this.debugDraw.resize(width, height, ratio);

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

    // If it was enabled we have to resize as it is not guaranteed that the renderer
    // had the correct size before.
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

    if (this.autoResize) {
      this.resizeToParent();
    }

    return this;
  }

  /**
   * Updates the renderer. Will be automatically called once on each frame
   * by the [[RendererSystem]].
   */
  public update(world: World): void {
    this.renderer.render(this.root);
  }

  /** Updates the resolution in which the game should be rendered. */
  public setResolution(width: number, height: number): this {
    this.resolution[0] = width;
    this.resolution[1] = height;

    if (this.autoResize) {
      this.resize(this.renderer.width, this.renderer.height);
    } else {
      this.resize(width, height);
    }

    return this;
  }

  /** Returns the current resolution in which the game is rendered. */
  public getResolution(): readonly [number, number] {
    return this.resolution;
  }

}
