import { Injectable, Pivot, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';
import { TmxGeometry } from '../parser';
import { TmxSpawnerConfig } from './tmx-spawner-config';


/**
 * Properties found on shape {@link TmxGeometry geometry} that is supposed to be
 * parsed into a {@link Collider}.
 */
export interface TmxPhysicsOptions {

  $collider?: {
    /** @see Collider.group */
    group?: number;
    /** @see Collider.mask */
    mask?: number;
    /** @see Collider.sensor */
    sensor?: boolean;
  };

}

/** Creates physics components from {@link TmxGeometry Tiled geometry}. */
@Injectable()
export class TmxPhysicsFactory {

  /**
   * @param config {@see TmxConfig}
   */
  constructor(public readonly config: TmxSpawnerConfig) {}

  /** @internal */
  private collider(geometry: TmxGeometry<TmxPhysicsOptions>, scale: XY): Collider {
    const shape = geometry.shape.copy();

    // When the parser converts ellipsis into circles it chooses the larger of the two
    // sides. Do the same for the circle shape.
    shape instanceof Rectangle
      ? shape.scale(scale)
      : shape.scale(Math.max(scale.x, scale.y));

    // Apply unit size to applied scale factor.
    shape.scale(1 / this.config.unitSize);

    const collider = new Collider(shape);

    if (geometry.properties.$collider) {
      const {
        group,
        mask,
        sensor
      } = geometry.properties.$collider;

      collider.sensor = Boolean(sensor);
      collider.group = group && group > -1 ? group : undefined;
      collider.mask = mask && mask > -1 ? mask : undefined;
    }

    return collider;
  }

  /**
   * Creates a {@link RigidBody} component from shape geometry placed on a tile via
   * the Tiled collision editor.
   *
   * @param width Unscaled tile width in px.
   * @param height Unscaled tile height in px.
   * @param shapes Shape geometry.
   * @param pivot Tile pivot ("objectalignment") of the tiles parent tileset.
   * @param scale Scale factor.
   */
  public tile(width: number, height: number, shapes: TmxGeometry<TmxPhysicsOptions>[], pivot: Pivot, scale = new Vec2(1, 1)): RigidBody {
    const body = new RigidBody();

    for (const item of shapes) {
      const collider = this.collider(item, scale);

      // Position shape based on tile pivot.
      collider.shape.x = (item.shape.x - (width * pivot.x)) / this.config.unitSize;
      collider.shape.y = (item.shape.y - (height * pivot.y)) / this.config.unitSize;

      body.attach(collider);
    }

    return body;
  }

  /**
   * Transforms the given `geometry` into a {@link RigidBody}, using the shape of the
   * geometry as {@link Collider}. The collider position will always be 0/0 because
   * the entire body is expected to be positioned with a {@link Transform} component.
   */
  public shape(geometry: TmxGeometry<TmxPhysicsOptions>, scale = new Vec2(1, 1)): RigidBody {
    const collider = this.collider(geometry, scale);

    collider.shape.x = 0;
    collider.shape.y = 0;

    return new RigidBody().attach(collider);
  }

}
