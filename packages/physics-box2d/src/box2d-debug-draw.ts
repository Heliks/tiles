import { b2Color, b2Draw, b2DrawFlags, b2Transform, b2Vec2, b2World } from '@flyover/box2d';
import { DebugDraw, Renderer, RendererPlugin, Screen } from '@heliks/tiles-pixi';
import { PI_2 } from '@heliks/tiles-math';
import { Inject, Injectable, OnInit, World } from '@heliks/tiles-engine';
import { B2_WORLD } from './const';


// Needs to be disabled for Box2D.
/* eslint-disable new-cap */
@Injectable()
export class Box2dDebugDraw extends b2Draw implements OnInit, RendererPlugin {

  /** @internal */
  private get ctx(): CanvasRenderingContext2D {
    return this.debugDraw.ctx;
  }

  /**
   * @param debugDraw {@see DebugDraw}
   * @param renderer {@see Renderer}
   * @param screen {@see Screen}
   * @param world Box2D world.
   */
  constructor(
    private readonly debugDraw: DebugDraw,
    private readonly renderer: Renderer,
    private readonly screen: Screen,
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
    console.log('DD ONINIT');
    this.world.SetDebugDraw(this);
  }

  /** @inheritDoc */
  public update(world: World): void {
    console.log('DD DRAW');
    this.world.DrawDebugData();
  }

  /** Box2D callback to translate the drawing canvas. */
  public PushTransform(transform: b2Transform): void {
    this.ctx.save();

    // Apply translate with unit size.
    this.debugDraw.translate(
      transform.p.x * this.screen.unitSize,
      transform.p.y * this.screen.unitSize
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
      vertices[0].x * this.screen.unitSize,
      vertices[0].y * this.screen.unitSize
    );

    for (const vertex of vertices) {
      this.ctx.lineTo(
        vertex.x * this.screen.unitSize,
        vertex.y * this.screen.unitSize
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
    ctx.fill();
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
    ctx.fill();
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
    const radius = _radius * this.screen.unitSize;
    const cx = center.x * this.screen.unitSize;
    const cy = center.y * this.screen.unitSize;

    ctx.beginPath();

    ctx.arc(cx, cy, radius, 0, PI_2, true);
    ctx.moveTo(cx, cy);

    ctx.lineTo(
      cx + axis.x * radius,
      cy + axis.y * radius
    );

    ctx.fillStyle = color.MakeStyleString(0.5);
    ctx.strokeStyle = color.MakeStyleString(1);

    ctx.fill();
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
