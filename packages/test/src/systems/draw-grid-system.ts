import { System } from "@tiles/entity-system";
import { Injectable } from "@tiles/injector";
import { Renderer, Graphics } from "@tiles/pixi";
import { Subscriber, Vec2, World } from "@tiles/engine";
import { RendererPlugin } from "@tiles/pixi/lib/types";

/**
 * System that draws a grid on top of the stage for debugging purposes.
 */
@Injectable()
export class DrawGridSystem implements RendererPlugin {

  /** Opacity value between 0 and 1 for the grid lines. */
  public opacity = 0.1;

  /** Hex value of the color that should be used to draw the grid lines. */
  public color = 0x0;

  /** The context on which we draw the grid. */
  protected readonly ctx: CanvasRenderingContext2D;

  /**
   * @param renderer [[Renderer]]
   */
  constructor(protected readonly renderer: Renderer) {
    this.ctx = renderer.debugDraw.ctx;
  }

  /** {@inheritDoc} */
  public boot(world: World): void {
    // Draw the grid once initially.
    // this.redraw(renderer.width, renderer.height);
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const us = this.renderer.unitSize;

    const width = this.renderer.width;
    const height = this.renderer.height;

    // Calculate the amount of columns and rows to draw.
    const cols = Math.floor(width / us);
    const rows = Math.floor(height / us);

    this.renderer.debugDraw.setLineStyle(0.5, this.color, this.opacity);

    // Convenience to not allocate unnecessary new arrays.
    let from: Vec2 = [0, 0];
    let dest: Vec2 = [0, 0];

    // Draw columns.
    for (let i = 0; i < cols; i++) {
      const x = i * us;

      from[0] = x;
      from[1] = 0;

      dest[0] = x;
      dest[1] = height;

      this.renderer.debugDraw.drawLine(from, dest);
    }

    // Draw rows
    for (let i = 0; i < rows; i++) {
      const y = i * us;

      from[0] = 0;
      from[1] = y;

      dest[0] = width;
      dest[1] = y;

      this.renderer.debugDraw.drawLine(from, dest);
    }
  }

}
