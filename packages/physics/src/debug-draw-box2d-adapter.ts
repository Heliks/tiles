import { b2Color, b2Draw, b2Transform, b2Vec2 } from "@flyover/box2d";
import { Graphics } from "@tiles/pixi";
import { rgb2hex } from "@tiles/pixi";

export class DebugDrawBox2dAdapter extends b2Draw {

  /** Offset on X axis (in px) that is applied to all draw calls. */
  protected ox = 0;

  /** Offset on Y axis (in px) that is applied to all draw calls. */
  protected oy = 0;

  /**
   * Some debug draw positions somehow attempt to transform the canvas via `PushTransform`
   * or `PopTransform` to move the "pointer". This would normally be done with
   * `CanvasRenderingContext2D.translate()` and `CanvasRenderingContext2D.restore()`, but
   * since we are not working with a normal canvas context both methods are not available,
   * so this is simulated by  manually saving those transforms here and updating [[ox]], [[oy]]
   * and the canvas rotation accordingly.
   *
   * @see ox
   * @see oy
   * @see PushTransform
   * @see PopTransform
   */
  protected transforms: [number, number, number][] = [];

  /**
   * @param target The render target where the debug information should be drawn to.
   * @param us Unit size (= pixel to meter ratio).
   */
  constructor(
    protected readonly target: Graphics,
    protected readonly us = 16
  ) {
    super();
  }

  /** Box2D callback to translate the drawing canvas. */
  public PushTransform(transform: b2Transform): void {
    const trans = [
      transform.p.x * this.us,
      transform.p.y * this.us,
      transform.q.GetAngle()
    ];

    this.ox = trans[0];
    this.oy = trans[1];
    this.target.rotation = trans[2];
  }

  /** Box2D callback to restore the last state of the drawing canvas. */
  public PopTransform(xf: b2Transform): void {
    this.transforms.pop();

    let trans: number[];

    // If there is a different transform in the list we'll use it, otherwise
    // we reset it entirely.
    if (this.transforms.length) {
      trans = this.transforms[ this.transforms.length - 1 ];
    }
    else {
      trans = [0, 0, 0];
    }

    this.ox = trans[0];
    this.oy = trans[1];
    this.target.rotation = trans[2];
  }

  /** Helper method to draw the lines of a polygon. */
  protected _drawPolygon(vertices: b2Vec2[]): void {
    this.target.moveTo(
      this.ox + vertices[0].x * this.us,
      this.oy + vertices[0].y * this.us
    );

    for (const vertex of vertices) {
      this.target.lineTo(
        this.ox + vertex.x * this.us,
        this.oy + vertex.y * this.us,
      );
    }
  }

  /** Draws the outline of a polygon. */
  public DrawPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    this.target.lineStyle(1, rgb2hex(
      color.r,
      color.b,
      color.g
    ));

    this._drawPolygon(vertices);
    this.target.closePath();
  }

  /** Draws a solid polygon. */
  public DrawSolidPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const hex = rgb2hex(color.r, color.b, color.g);

    this.target
      .beginFill(hex, 0.5)
      .lineStyle(1, hex);

    this._drawPolygon(vertices);
    this.target.closePath();
  }

  /** Box2D callback to draw the outline of a circle. */
  public DrawCircle(center: b2Vec2, radius: number, color: b2Color): void {
    console.warn('DrawCircle is not yet implemented.');

    /*
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
    ctx.stroke();*/
  }

  /** Box2D callback to draw the inside of a circle. */
  public DrawSolidCircle(center: b2Vec2, radius: number, axis: b2Vec2, color: b2Color): void {
    console.warn('DrawSolidCircle is not yet implemented.');

    /*
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
     */
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