import { b2Color, b2Draw, b2DrawFlags, b2Transform, b2Vec2, b2World } from '@heliks/box2d';
import { Inject, Injectable, OnInit, PI_2, Subscriber, System } from '@heliks/tiles-engine';
import { Camera, DebugDraw, Renderer } from '@heliks/tiles-pixi';
import { B2_RAYCASTS, B2_WORLD, RaycastEvent, RaycastQueue } from './const';

/* eslint-disable new-cap */

@Injectable()
export class Box2dDebugDraw extends b2Draw implements OnInit, System {

  /** @internal */
  private get ctx(): CanvasRenderingContext2D {
    return this.debugDraw.context;
  }

  /** @internal */
  private raycasts$!: Subscriber<RaycastEvent>;

  constructor(
    private readonly camera: Camera,
    private readonly debugDraw: DebugDraw,
    private readonly renderer: Renderer,
    @Inject(B2_RAYCASTS)
    private readonly raycasts: RaycastQueue,
    @Inject(B2_WORLD)
    private readonly world: b2World
  ) {
    super();

    // Enable all relevant draw flags.
    // eslint-disable-next-line new-cap
    this.SetFlags(b2DrawFlags.e_jointBit | b2DrawFlags.e_shapeBit);
  }

  /** @inheritDoc */
  public onInit(): void {
    this.world.SetDebugDraw(this);
    this.raycasts$ = this.raycasts.subscribe();
  }

  private drawRaycast(raycast: RaycastEvent): void {
    this.ctx.save();
    this.ctx.beginPath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#ff00e5';

    this.ctx.moveTo(
      (raycast.start.x - this.camera.world.x) * this.camera.unitSize,
      (raycast.start.y - this.camera.world.y) * this.camera.unitSize
    );

    this.ctx.lineTo(
      (raycast.end.x - this.camera.world.x) * this.camera.unitSize,
      (raycast.end.y - this.camera.world.y) * this.camera.unitSize
    );

    this.ctx.stroke();
    this.ctx.restore();
  }

  /** @inheritDoc */
  public update(): void {
    this.world.DebugDraw();

    // Draw raycasts.
    for (const raycast of this.raycasts$.read()) {
      this.drawRaycast(raycast);
    }
  }

  /** Box2D callback to translate the drawing canvas. */
  public PushTransform(transform: b2Transform): void {
    this.ctx.save();

    // Apply translate with unit size.
    this.debugDraw.translate(
      transform.p.x * this.camera.unitSize * this.camera.zoom,
      transform.p.y * this.camera.unitSize * this.camera.zoom
    );

    // Set rotation
    this.ctx.rotate(transform.q.GetAngle());
  }

  /** Box2D callback to restore the last state of the drawing canvas. */
  public PopTransform(): void {
    this.ctx.restore();
  }

  /** Helper method to draw the lines of a polygon. */
  protected drawPolygonVertices(vertices: b2Vec2[]): void {
    this.ctx.moveTo(
      vertices[0].x * this.camera.unitSize * this.camera.zoom,
      vertices[0].y * this.camera.unitSize * this.camera.zoom
    );

    for (const vertex of vertices) {
      this.ctx.lineTo(
        vertex.x * this.camera.unitSize * this.camera.zoom,
        vertex.y * this.camera.unitSize * this.camera.zoom
      );
    }

    this.ctx.closePath();
  }

  /** Draws the outline of a polygon. */
  public DrawPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.strokeStyle = color.MakeStyleString(1);

    this.drawPolygonVertices(vertices);

    // Draw the shape.
    ctx.stroke();
  }

  /** Draws a solid polygon. */
  public DrawSolidPolygon(vertices: b2Vec2[], vertexes: number, color: b2Color): void {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.fillStyle = color.MakeStyleString(0.5);
    ctx.strokeStyle = color.MakeStyleString(1);

    this.drawPolygonVertices(vertices);

    // Draw the shape.
    ctx.stroke();
  }

  /** Box2D callback to draw the outline of a circle. */
  public DrawCircle(): void {
    console.warn('DrawCircle is not yet implemented.');
  }

  /** Box2D callback to draw the inside of a circle. */
  public DrawSolidCircle(center: b2Vec2, _radius: number, axis: b2Vec2, color: b2Color): void {
    const ctx = this.ctx;

    // Apply unit size to radius and position.
    const radius = _radius * this.camera.unitSize * this.camera.zoom;
    const cx = center.x * this.camera.unitSize * this.camera.zoom;
    const cy = center.y * this.camera.unitSize * this.camera.zoom;

    ctx.beginPath();

    ctx.arc(cx, cy, radius, 0, PI_2, true);
    ctx.moveTo(cx, cy);

    ctx.lineTo(
      cx + axis.x * radius,
      cy + axis.y * radius
    );

    ctx.strokeStyle = color.MakeStyleString(1);
    ctx.stroke();
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
