import { EventQueue, Injectable, Subscriber } from '@heliks/tiles-engine';
import * as PIXI from 'pixi.js';
import { Container, RenderTexture } from 'pixi.js';
import { Drawable, Screen, ScreenEvent } from './common';
import { RendererConfig } from './config';
import { DebugDraw } from './debug-draw';
import { Layers } from './layer';


/** Event that occurs every time the renderer is resized. */
export interface OnResizeEvent {
  screen: Screen;
}

@Injectable()
export class Renderer {

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /**
   * Root container that holds all {@link Drawable drawables} that are rendered. It's
   * not recommended to manually add anything here. Instead, the {@link Stage} can be
   * used to add drawables as needed.
   */
  public readonly root = new Container();

  /**
   * If set to `true`, the renderer will automatically be resized every time the window
   * size or screen resolution changes.
   *
   * @internal
   */
  private isAutoResizeEnabled = false;

  /** @internal */
  private readonly onScreenUpdate$: Subscriber<ScreenEvent>;

  /** Contains the renderers height in px. */
  public get height(): number {
    return this.renderer.view.height;
  }

  /** Contains the renderers width in px. */
  public get width(): number {
    return this.renderer.view.width;
  }

  constructor(
    public readonly config: RendererConfig,
    public readonly debugDraw: DebugDraw,
    public readonly layers: Layers,
    public readonly screen: Screen,
    public readonly renderer: PIXI.Renderer
  ) {
    this.onScreenUpdate$ = screen.events.subscribe();

    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Create the scenes render hierarchy.
    // 1. Stage
    // 2. Overlay
    // 3. Debug
    this.root.addChild(
      this.layers.container,
      this.debugDraw.view
    );
  }

  /**
   * Sets the renderers background color to the hex value of `color`. It takes until
   * the next renderer update until the new background color is applied.
   */
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
        this.screen.resize(w, h);
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
    this.isAutoResizeEnabled = value;

    // If it was enabled we have to resize as it is not guaranteed that the renderer
    // had the correct size before.
    if (value) {
      this.resizeToParent();
    }

    return this;
  }

  /** Event that is called when the viewport size has changed. */
  protected onWindowResize(): void {
    if (this.isAutoResizeEnabled) {
      this.resizeToParent();
    }
  }

  /** Appends the renderer as <canvas> element to `target`. */
  public appendTo(target: Element): this {
    target.append(this.renderer.view);

    if (this.isAutoResizeEnabled) {
      this.resizeToParent();
    }

    return this;
  }

  /** Applies `screen` dimensions to the renderer. */
  private updateRendererDimensions(): void {
    this.renderer.resize(this.screen.size.x, this.screen.size.y);

    this.debugDraw
      .resize(this.screen.size.x, this.screen.size.y)
      .scale(this.screen.scale.x, this.screen.scale.y);
  }

  /**
   * Renders the given `drawable` to the WebGL view.
   *
   * @param drawable The object that should be rendered to the WebGL view.
   * @param texture (optional) The texture to which the drawable should be rendered to.
   */
  public render(drawable: Drawable, texture?: RenderTexture): void {
    this.renderer.render(drawable, texture);
  }

  /** @internal */
  private onScreenResize(): void {
    this.updateRendererDimensions();

    this.onResize.push({
      screen: this.screen
    });
  }

  /**
   * Updates the renderer and re-draws the current scene. Will be automatically called
   * once on each frame by the [[RendererSystem]].
   */
  public update(): void {
    for (const event of this.onScreenUpdate$.read()) {
      if (event === ScreenEvent.Resize) {
        this.onScreenResize();
      }
    }

    this.debugDraw.texture.update();

    // Render the final image.
    this.renderer.render(this.root);
  }

}
