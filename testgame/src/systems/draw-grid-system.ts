import { Injectable } from "@tiles/injector";
import { DebugDraw, Renderer } from "@tiles/pixi";
import { Vec2 } from "@tiles/engine";
import { RendererPlugin } from "@tiles/pixi";

/**
 * System that draws a grid on top of the stage for debugging purposes.
 */
@Injectable()
export class DrawGridSystem implements RendererPlugin {

  /** Opacity value between 0 and 1 for the grid lines. */
  public opacity = 1.1;

  /** Hex value of the color that should be used to draw the grid lines. */
  public color = 0x0;

  /** The context on which we draw the grid. */
  protected readonly ctx: CanvasRenderingContext2D;

  /**
   * @param debugDraw [[DebugDraw]]
   * @param renderer [[Renderer]]
   */
  constructor(
    protected readonly debugDraw: DebugDraw,
    protected readonly renderer: Renderer

  ) {
    this.ctx = renderer.debugDraw.ctx;
  }

  /** {@inheritDoc} */
  public update(): void {
    const draw = this.debugDraw
      .save()
      .setLineStyle(0.5, this.color, this.opacity)
      .translate(0, 0);

    const us = this.renderer.dimensions.unitSize;

    const width = this.renderer.dimensions.size[0];
    const height = this.renderer.dimensions.size[1];

    // Calculate the amount of columns and rows to draw.
    const cols = Math.floor(width / us);
    const rows = Math.floor(height / us);

    // Convenience to not allocate unnecessary new arrays.
    const from: Vec2 = [0, 0];
    const dest: Vec2 = [0, 0];

    // Draw columns.
    for (let i = 0; i < cols; i++) {
      const x = i * us;

      from[0] = x;
      from[1] = 0;

      dest[0] = x;
      dest[1] = height;

      draw.drawLine(from, dest);
    }

    // Draw rows
    for (let i = 0; i < rows; i++) {
      const y = i * us;

      from[0] = 0;
      from[1] = y;

      dest[0] = width;
      dest[1] = y;

      draw.drawLine(from, dest);
    }

    // Restore the previous transformation matrix.
    draw.restore();
  }

}
