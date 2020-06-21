import { ProcessingSystem, Subscriber, Transform, Vec2, World } from "@tiles/engine";
import { ComponentEventType, Entity, Query, System } from "@tiles/entity-system";
import { Graphics } from 'pixi.js';
import { Renderer } from "./renderer";
import { Injectable } from "@tiles/injector";

/** Shape forms. */
export enum ShapeKind {
  Circle,
  Rect,
}

/**
 * Adds a simple shape display to an entity.
 */
export class ShapeDisplay {

  /**
   * Opacity with which the [[fillColor]] will be drawn. `0` is completely
   * transparent while `1` is completely visible.
   */
  public fillAlpha = 1;

  /** If set to a number, it will be used as the fill color for the shape. */
  public fillColor?: number;

  /**
   * Display a rectangle shape, where `data` is a vector containing the size of
   * the rectangle.
   */
  constructor(kind: ShapeKind.Rect, data: Vec2);

  /**
   * Display a rectangle shape, where `data` is a vector containing the size of
   * the rectangle.
   */
  constructor(kind: ShapeKind.Circle, data: number);

  /**
   * @param kind The kind of shape that should be rendered.
   * @param data The data needed to render the shape. Changes depending in the
   *  shape `kind`.
   */
  constructor(
    public readonly kind: ShapeKind,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly data: any
  ) {}

  /**
   * Sets the fill `color` and `alpha`. If `alpha` is not set it will
   * automatically be set to 1.
   */
  public fill(color: number, alpha = 1): this {
    this.fillAlpha = alpha;
    this.fillColor = color;

    return this;
  }

}

/** Helper function to draw the information from `shape` to a canvas. */
export function draw(shape: ShapeDisplay, us: number): Graphics {
  const graphics = new Graphics();

  // Set fill color.
  if (shape.fillColor !== undefined) {
    graphics.beginFill(
      shape.fillColor,
      shape.fillAlpha
    );
  }

  switch (shape.kind) {
  // Draw circles.
    case ShapeKind.Circle:
      const radius = shape.data * us;

      // Circle needs to be offset by the circle radius so that the circle center is the
      // same as the canvas center.
      graphics.drawCircle(radius, radius, radius);
      break;
    // Draw rectangles.
    case ShapeKind.Rect:
      graphics.drawRect(0, 0, shape.data[ 0 ] * us, shape.data[ 1 ] * us);
      break;
  }

  graphics.endFill();

  // Set the point from which positions are calculated to the center, as the engines
  // transform handles positions that way.
  graphics.pivot.set(graphics.width / 2, graphics.height / 2);

  return graphics;
}

/** System that renders simple shapes. */
@Injectable()
export class ShapeDisplaySystem extends ProcessingSystem implements System {

  /** Subscribes to `ComponentEvents` on the `ShapeDisplay` storage. */
  protected onDisplayModify$!: Subscriber;

  /**
   * Canvases where entity shapes are drawn to, mapped to the entity to which they
   * belong.
   */
  protected canvases = new Map<Entity, Graphics>();

  /**
   * @param renderer [[Renderer]]
   */
  constructor(protected readonly renderer: Renderer) {
    super();
  }

  /** {@inheritDoc} */
  public boot(world: World): void {
    // Subscribe to modifications in the ShapeDisplay storage.
    this.onDisplayModify$ = world.storage(ShapeDisplay).events().subscribe();

    return super.boot(world);
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        ShapeDisplay,
        Transform
      ]
    };
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    // Get unit size.
    const us = this.renderer.config.unitSize;

    // Component storages.
    const _display = world.storage(ShapeDisplay);
    const _trans = world.storage(Transform);

    // Handle newly added entities.
    for (const event of _display.events().read(this.onDisplayModify$)) {
      let canvas;

      switch (event.type) {
        case ComponentEventType.Added:
        // Draw the entity shape on a canvas.
          canvas = draw(_display.get(event.entity), us);

          this.canvases.set(event.entity, canvas);

          // Add the canvas to the game stage to render it.
          this.renderer.stage.add(canvas);
          break;
        case ComponentEventType.Removed:
          canvas = this.canvases.get(event.entity);

          // Delete cached canvas and remove it from the stage so that it no longer will
          // be rendered.
          if (canvas) {
            this.canvases.delete(event.entity);
            this.renderer.stage.remove(canvas);
          }
          break;
      }
    }

    // Process displays.
    for (const entity of this.group.entities) {
      const canvas = this.canvases.get(entity);

      if (canvas) {
        const trans = _trans.get(entity);

        // Move the canvas according to the entities position. This needs to be displaced
        // because the transform position is based on the center, while the renderer uses
        // positions relative to the top left corner.
        canvas.x = trans.x * us;
        canvas.y = trans.y * us;

        canvas.rotation = trans.rotation;
      }
    }
  }

}
