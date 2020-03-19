import { b2Color, b2Draw, b2Transform, b2Vec2 } from "@flyover/box2d";

export class DebugDrawAdapter extends b2Draw {

  /** Canvas where the debug data is drawn to. */
  public readonly view: HTMLCanvasElement;

  /** Drawing context for [[view]] */
  protected readonly ctx: CanvasRenderingContext2D;

  /**
   * @param us Unit size (Pixel to meter ratio).
   */
  constructor(protected readonly us = 16) {
    super();

    const view = document.createElement('canvas');

    view.style.position = 'absolute';

    view.style.left = "0px";
    view.style.top = "0px";

    const ctx = view.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get 2D rendering context.');
    }

    this.view = view;
    this.ctx = ctx;
  }

  /** Box2D callback to translate the drawing canvas. */
  public PushTransform(transform: b2Transform): void {
    this.ctx.save();
    this.ctx.translate(
      transform.p.x * this.us,
      transform.p.y * this.us
    );

    this.ctx.rotate(transform.q.GetAngle());
  }

  /** Box2D callback to restore the last state of the drawing canvas. */
  public PopTransform(xf: b2Transform): void {
    this.ctx.restore();
  }

  /** Box2D callback to draw the outline of a polygon. */
  public DrawPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.moveTo(
      vertices[0].x * this.us,
      vertices[0].y * this.us
    );

    for (const vertex of vertices) {
      ctx.lineTo(
        vertex.x * this.us,
        vertex.y * this.us
      );
    }

    ctx.closePath();

    // Draw outline.
    ctx.strokeStyle = color.MakeStyleString(1);
    ctx.stroke();
  }

  /** Box2D callback to draw the inside of a polygon. */
  public DrawSolidPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.moveTo(
      vertices[0].x * this.us,
      vertices[0].y * this.us
    );

    for (const vertex of vertices) {
      ctx.lineTo(
        vertex.x * this.us,
        vertex.y * this.us
      );
    }

    ctx.closePath();

    ctx.fillStyle = color.MakeStyleString(0.5);
    ctx.strokeStyle = color.MakeStyleString(1);

    ctx.fill();
    ctx.stroke();
  }

  /** Box2D callback to draw the outline of a circle. */
  public DrawCircle(center: b2Vec2, radius: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(
      center.x * this.us,
      center.y * this.us,
      radius,
      0,
      Math.PI * 2,
      true
    );

    ctx.strokeStyle = color.MakeStyleString(1);
    ctx.stroke();
  }

  /** Box2D callback to draw the inside of a circle. */
  public DrawSolidCircle(center: b2Vec2, radius: number, axis: b2Vec2, color: b2Color): void {
    const ctx = this.ctx;

    const centerX: number = center.x;
    const centerY: number = center.y;

    ctx.beginPath();

    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.moveTo(centerX, centerY);

    ctx.lineTo(
      (centerX + (axis.x * this.us) * radius),
      (centerY + (axis.y * this.us) * radius)
    );

    ctx.fillStyle = color.MakeStyleString(0.5);
    ctx.strokeStyle = color.MakeStyleString(1);

    ctx.fill();
    ctx.stroke();
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