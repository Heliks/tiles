import { b2Color, b2Draw, b2Transform, b2Vec2, b2World } from "@flyover/box2d";
import { Injectable } from "@tiles/injector";

@Injectable()
export class DrawRigidBodiesBox2d extends b2Draw  {

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected readonly us: number
  ) {
    super();
  }

  /** {@inheritDoc} */
  public update(bWorld: b2World): void {
    // Draw the Box2D debug information.
    bWorld.DrawDebugData();
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
