import { Injectable, Pivot, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';
import { TmxGeometry } from '../parser';
import { TmxSpawnerConfig } from './tmx-spawner-config';


/** Creates physics components from {@link TmxGeometry Tiled geometry}. */
@Injectable()
export class TmxPhysicsFactory {

  /**
   * @param config {@see TmxConfig}
   */
  constructor(public readonly config: TmxSpawnerConfig) {}

  /** @internal */
  private collider(geometry: TmxGeometry, scale: XY): Collider {
    const shape = geometry.shape.copy();

    // Apply scale factor.
    if (shape instanceof Rectangle) {
      shape.scale(scale);
    }
    else {
      shape.scale(Math.max(scale.x, scale.y));
    }

    // Scale shape size & position by configured unit size.
    shape.scale(1 / this.config.unitSize);

    return new Collider(shape);
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
  public tile(width: number, height: number, shapes: TmxGeometry[], pivot: Pivot, scale = new Vec2(1, 1)) {
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
   * Creates a {@link RigidBody} component from the {@link TmxGeometry} of a free-
   * floating shape placed on an {@link TmxObjectLayer object layer}.
   *
   * The position of the physics {@link Collider} that is created from the geometry is
   * always 0/0. This is because we assume that the entity to which the rigid body will
   * be attached to, is positioned with a {@link Transform} component.
   */
  public shape(geometry: TmxGeometry, scale = new Vec2(1, 1)): RigidBody {
    const collider = this.collider(geometry, scale);

    collider.shape.x = 0;
    collider.shape.y = 0;

    return new RigidBody().attach(collider);
  }

}
