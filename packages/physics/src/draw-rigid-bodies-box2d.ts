import { b2Color, b2Draw, b2Transform, b2Vec2, b2World } from "@flyover/box2d";
import { DebugDraw } from "@tiles/pixi";

// Needs to be disabled for Box2D.
/* eslint-disable new-cap */

export class DrawRigidBodiesBox2d extends b2Draw  {

  /** @hidden */
  private get ctx(): CanvasRenderingContext2D {
    return this.debugDraw.ctx;
  }

  constructor(
    protected readonly debugDraw: DebugDraw,
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
    this.debugDraw.translate(
      transform.p.x * this.us,
      transform.p.y * this.us
    );

    // Set rotation
    this.ctx.rotate(transform.q.GetAngle());
  }

  /** Box2D callback to restore the last state of the drawing canvas. */
  public PopTransform(): void {
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
        vertex.y * this.us
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
  public DrawCircle(): void {
    console.warn('DrawCircle is not yet implemented.');
  }

  /** Box2D callback to draw the inside of a circle. */
  public DrawSolidCircle(): void {
    console.warn('DrawSolidCircle is not yet implemented.');
  }

  /** Box2D callback to draw particles. */
  public DrawParticles(): void {
    console.warn('DrawParticles is not yet implemented.')
  }

  /** Box2D callback to draw a segment. */
  public DrawSegment(): void {
    console.warn('DrawSegment is not yet implemented.')
  }

  /** Box2D callback to draw a transform. */
  public DrawTransform(): void {
    console.warn('DrawTransform is not yet implemented.')
  }

  /** Box2D callback to draw a point. */
  public DrawPoint(): void {
    console.warn('DrawPoint is not yet implemented.');
  }

}
