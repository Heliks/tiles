import { AssetStorage } from '@heliks/tiles-assets';
import { EventQueue, Injectable } from '@heliks/tiles-engine';
import { vec2 } from '@heliks/tiles-math';
import * as PIXI from 'pixi.js';
import { Camera } from './camera';
import { DebugDraw } from './debug-draw';
import { Container } from './drawable';
import { Screen } from './screen';
import { Overlay, Stage } from './stage';


/** Event that occurs every time the renderer is resized. */
export interface OnResizeEvent {
  screen: Screen;
}

@Injectable()
export class Renderer {

  /** Queues events for when the renderer is resized. */
  public readonly onResize = new EventQueue<OnResizeEvent>();

  /** Asset storage for loaded textures. */
  public readonly textures: AssetStorage<PIXI.Texture> = new Map();

  /**
   * If set to `true`, the renderer will automatically be resized every time the window
   * size or screen resolution changes.
   */
  private isAutoResizeEnabled = false;

  /**
   * Contains half of the screen size *scaled* to the screen scale. We cache this
   * here so we don't have to do this calculation on every frame. This is updated
   * every time when screen is re-scaled.
   *
   * @see Screen.size
   * @see Screen.scale
   * @see updateCamera
   */
  private readonly screenSizeScaled2 = vec2(0, 0);

  /**
   * Root container that holds all draw-ables that make up the whole game scene.
   * @see Container
   */
  protected readonly root = new Container();

  /** Contains the renderers height in px. */
  public get height(): number {
    return this.renderer.view.height;
  }

  /** Contains the renderers width in px. */
  public get width(): number {
    return this.renderer.view.width;
  }

  constructor(
    public readonly camera: Camera,
    public readonly debugDraw: DebugDraw,
    public readonly overlay: Overlay,
    public readonly screen: Screen,
    public readonly stage: Stage,
    public readonly renderer: PIXI.Renderer
  ) {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Create the scenes render hierarchy.
    // 1. Stage
    // 2. Overlay
    // 3. Debug
    this.root.addChild(
      this.stage,
      this.overlay,
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
  private updateRendererDimensions(screen: Screen): void {
    this.screenSizeScaled2.x = (this.screen.size.x / this.screen.scale.x) >> 1;
    this.screenSizeScaled2.y = (this.screen.size.y / this.screen.scale.y) >> 1;

    this.renderer.resize(screen.size.x, screen.size.y);

    // Note: Because of an issue in PIXi.JS stage and debug draw are resized directly
    // and independently from the renderer because the "artificial" texture used
    // inside of the debug draw will be rendered blurry otherwise.
    this.stage.scale.set(screen.scale.x, screen.scale.y);

    this.debugDraw
      .resize(screen.size.x, screen.size.y)
      .scale(screen.scale.x, screen.scale.y);

    // As the overlay it is fixed in size and position we can update this here instead
    // of doing it every frame.
    this.overlay.pivot.set(-(screen.size.x >> 1), -(screen.size.y >> 1));
  }

  /** @internal */
  private updateCamera(): void {
    this.stage.pivot.set(
      (this.camera.world.x * this.screen.unitSize) - this.screenSizeScaled2.x,
      (this.camera.world.y * this.screen.unitSize) - this.screenSizeScaled2.y
    );
  }

  /**
   * Updates the renderer and re-draws the current scene. Will be automatically called
   * once on each frame by the [[RendererSystem]].
   */
  public update(): void {
    const screen = this.screen;

    if (screen.dirty) {
      this.updateRendererDimensions(screen);

      this.onResize.push({
        screen: this.screen
      });

      screen.dirty = false;
    }

    if (this.camera.enabled) {
      this.updateCamera();
    }

    this.debugDraw.texture.update();

    // Render the final image.
    this.renderer.render(this.root);
  }

}
