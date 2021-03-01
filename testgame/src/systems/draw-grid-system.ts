import { Injectable, vec2 } from '@heliks/tiles-engine';
import { Camera, DebugDraw, Renderer, RendererPlugin, ScreenDimensions } from '@heliks/tiles-pixi';

/** System that draws grids. */
@Injectable()
export class DrawGridSystem implements RendererPlugin {

  /** Opacity value between 0 and 1 for the grid lines. */
  public opacity = 1.1;

  /** Hex value of the color that should be used to draw the grid lines. */
  public color = 0x0;

  /** The context on which we draw the grid. */
  protected readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly camera: Camera,
    private readonly debugDraw: DebugDraw,
    private readonly dim: ScreenDimensions,
    private readonly renderer: Renderer
  ) {
    this.ctx = renderer.debugDraw.ctx;
  }

  /** @inheritDoc */
  public update(): void {
    const draw = this.debugDraw
      .save()
      .setLineStyle(0.5, this.color, this.opacity)
      .translate(0, 0);

    const us1 = this.dim.unitSize;
    const us2 = this.dim.unitSize / 2;

    const width = this.renderer.dimensions.size.x;
    const height = this.renderer.dimensions.size.y;

    // Calculate the amount of columns and rows to draw.
    const cols = Math.floor(this.dim.size.x / us1);
    const rows = Math.floor(height / us1);

    // Convenience to not allocate unnecessary new arrays.
    const from = vec2(0, 0);
    const dest = vec2(0, 0);

    // Calculate minimum positions where we need to start drawing depending on the
    // current camera position. We leave a small buffer at the edges to make sure that
    // we really did draw over the whole screen.
    const minX = this.camera.screen.x - (this.camera.screen.x % us1) + us1 + us2;
    const minY = this.camera.screen.y - (this.camera.screen.y % us1) + us1 + us2;

    // Draw columns.
    for (let i = 0; i < cols; i++) {
      const x = ((i * us1) - minX) + us2;

      from.x = x;
      from.y = -minY;

      dest.x = x;
      dest.y = height;

      draw.drawLine(from, dest);
    }

    // Draw rows
    for (let i = 0; i < rows; i++) {
      const y = (i * us1) - minY + us2;

      from.x = -minX;
      from.y = y;

      dest.x = width;
      dest.y = y;

      draw.drawLine(from, dest);
    }

    // Restore the previous transformation matrix.
    draw.restore();
  }

}
