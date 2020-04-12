import { System } from "@tiles/entity-system";
import { Inject, Injectable } from "@tiles/injector";
import { Renderer } from "@tiles/pixi";

/**
 * System that draws a grid on top of the stage for debugging purposes.
 */
@Injectable()
export class DrawGridSystem implements System {

  /** Opacity value between 0 and 1 for the grid lines. */
  public opacity = 0.1;

  /** Hex value of the color that should be used to draw the grid lines. */
  public color = 0x0;

  constructor(protected readonly renderer: Renderer) {}

  /** {@inheritDoc} */
  update(): void {
    const ctx = this.renderer.debugDraw;
    const us = this.renderer.config.unitSize;

    const width  = 500;
    const height = 500;

    const cols = Math.floor(width / us);
    const rows = Math.floor(height / us);

    ctx.lineStyle(0.5, this.color, this.opacity);

    // Draw columns.
    for (let i = 0; i < cols; i++) {
      const x = i * us;

      ctx.moveTo(x, 0).lineTo(x, height);
    }

    // Draw rows
    for (let i = 0; i < rows; i++) {
      const y = i * us;

      ctx.moveTo(0, y).lineTo(width, y);
    }
  }

}
