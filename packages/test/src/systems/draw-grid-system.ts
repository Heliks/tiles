import { System } from "@tiles/entity-system";
import { Injectable } from "@tiles/injector";
import { Renderer, Graphics } from "@tiles/pixi";
import { Subscriber } from "@tiles/engine";

/**
 * System that draws a grid on top of the stage for debugging purposes.
 */
@Injectable()
export class DrawGridSystem implements System {

  /** Opacity value between 0 and 1 for the grid lines. */
  public opacity = 0.1;

  /** Hex value of the color that should be used to draw the grid lines. */
  public color = 0x0;

  /** The context on which we draw the grid. */
  protected readonly ctx = new Graphics();

  /** Subscriber that listens to renderer resize events. */
  protected readonly onRendererResize$: Subscriber;

  /**
   * @param renderer [[Renderer]]
   */
  constructor(protected readonly renderer: Renderer) {
    renderer.debugDraw.addChild(this.ctx);

    // Subscribe to resize events.
    this.onRendererResize$ = renderer.onResize.subscribe();
  }

  /** Redraws the grid. */
  protected redraw(width: number, height: number): void {
    const us = this.renderer.config.unitSize;

    // Calculate the amount of columns and rows to draw.
    const cols = Math.floor(width / us);
    const rows = Math.floor(height / us);

    // Prepare for redrawing.
    this.ctx.clear().lineStyle(0.5, this.color, this.opacity);

    // Draw columns.
    for (let i = 0; i < cols; i++) {
      const x = i * us;

      this.ctx.moveTo(x, 0).lineTo(x, height);
    }

    // Draw rows
    for (let i = 0; i < rows; i++) {
      const y = i * us;

      this.ctx.moveTo(0, y).lineTo(width, y);
    }
  }

  /** {@inheritDoc} */
  public boot(): void {
    // Draw the grid once initially.
    this.redraw(this.renderer.width, this.renderer.height);
  }

  /** {@inheritDoc} */
  update(): void {
    for (const event of this.renderer.onResize.read(this.onRendererResize$)) {
      this.ctx.scale.set(event.ratio);

      // Redraw the grid.
      this.redraw(event.width, event.height);
    }
  }

}
