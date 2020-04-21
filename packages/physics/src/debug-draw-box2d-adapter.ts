import { b2Color, b2Draw, b2Transform, b2Vec2, b2World } from "@flyover/box2d";
import { Sprite, Texture } from "@tiles/pixi";

/**
 * Returns the 2d drawing context of `canvas`. Throws an error if retrieving
 * the context fails.
 */
export function createDrawingContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to get 2D drawing context.');
  }

  return ctx;
}

export class DebugDrawBox2dAdapter extends b2Draw {

  /** The renderable that can be added to the renderer to display the debug draw. */
  public readonly view: Sprite;

  /** The canvas where the debug information is drawn.*/
  protected readonly canvas = document.createElement('canvas');

  /** Drawing context. */
  protected readonly ctx: CanvasRenderingContext2D;

  /** WebGL texture created from [[canvas]]. */
  protected readonly texture: Texture;

  /**
   * @param us Unit size (= pixel to meter ratio).
   */
  constructor(protected readonly us = 16) {
    super();

    this.ctx = createDrawingContext(this.canvas);

    // Create a WebGL texture for the canvas element.
    this.texture = Texture.from(this.canvas);

    // Create the sprite that can be drawn to the stage to display the debug draw.
    this.view = Sprite.from(this.texture);
  }

  /** Resize the [[canvas]] and scale it according to `ratio`. */
  public resize(width: number, height: number, ratio: number): void {
    // Resize the canvas element.
    this.canvas.width  = width;
    this.canvas.height = height;

    // Scale drawing context according to scale ratio.
    this.ctx.scale(ratio, ratio);
  }

  /** Update the debug draw. */
  public update(bWorld: b2World): void {
    // Clear the canvas so that we can re-draw.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the Box2D debug information.
    bWorld.DrawDebugData();

    // The DrawDebugData call draws onto a canvas element, so we need
    // to update the WebGL texture with the new picture.
    this.texture.update();
  }

  /** Box2D callback to translate the drawing canvas. */
  public PushTransform(transform: b2Transform): void {
    this.ctx.save();

    // Apply translate with unit size.
    this.ctx.translate(
      transform.p.x * this.us,
      transform.p.y * this.us
    );

    // Set rotation
    this.ctx.rotate(transform.q.GetAngle());
  }

  /** Box2D callback to restore the last state of the drawing canvas. */
  public PopTransform(xf: b2Transform): void {
    this.ctx.restore();
  }

  /** Helper method to draw the lines of a polygon. */
  protected _drawPolygonVertices(vertices: b2Vec2[]): void {
    this.ctx.moveTo(
      vertices[0].x * this.us,
      vertices[0].y * this.us
    );

    for (const vertex of vertices) {
      this.ctx.lineTo(
        vertex.x * this.us,
        vertex.y * this.us,
      );
    }

    this.ctx.closePath();
  }

  /** Draws the outline of a polygon. */
  public DrawPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.strokeStyle = color.MakeStyleString(1);

    this._drawPolygonVertices(vertices);

    // Draw the shape.
    ctx.fill();
    ctx.stroke();
  }

  /** Draws a solid polygon. */
  public DrawSolidPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.fillStyle = color.MakeStyleString(0.5);
    ctx.strokeStyle = color.MakeStyleString(1);

    this._drawPolygonVertices(vertices);

    // Draw the shape.
    ctx.fill();
    ctx.stroke();
  }

  /** Box2D callback to draw the outline of a circle. */
  public DrawCircle(center: b2Vec2, radius: number, color: b2Color): void {
    console.warn('DrawCircle is not yet implemented.');
  }

  /** Box2D callback to draw the inside of a circle. */
  public DrawSolidCircle(center: b2Vec2, radius: number, axis: b2Vec2, color: b2Color): void {
    console.warn('DrawSolidCircle is not yet implemented.');
  }

  /** Box2D callback to draw particles. */
  public DrawParticles(centers: b2Vec2[], radius: number, colors: b2Color[] | null, count: number) {
    console.warn('DrawParticles is not yet implemented.')
  }

  /** Box2D callback to draw a segment. */
  public DrawSegment(p1: b2Vec2, p2: b2Vec2, color: b2Color): void {
    console.warn('DrawSegment is not yet implemented.')
  }

  /** Box2D callback to draw a transform. */
  public DrawTransform(xf: b2Transform): void {
    console.warn('DrawTransform is not yet implemented.')
  }

  /** Box2D callback to draw a point. */
  public DrawPoint(p: b2Vec2, size: number, color: b2Color): void {
    console.warn('DrawPoint is not yet implemented.');
  }

}
