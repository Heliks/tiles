import { Injectable, Pivot, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { Collider, RigidBody } from '@heliks/tiles-physics';
import { TmxGeometry } from '../parser';
import { parseBitSet, TmxBitSet } from './bitset';
import { TmxSpawnerConfig } from './tmx-spawner-config';


/**
 * Properties found on shape {@link TmxGeometry geometry} that is supposed to be
 * parsed into a {@link Collider}.
 */
export interface ColliderProps {
  /** If `true`, the collider will be made into a {@link Collider.sensor}. */
  sensor?: boolean;
  /** Bitset for the colliders collision group, if any. */
  group?: TmxBitSet;
  /** Bitset for the colliders collision mask, if any. */
  mask?: TmxBitSet;
}

/** Creates physics components from {@link TmxGeometry Tiled geometry}. */
@Injectable()
export class TmxPhysicsFactory {

  /**
   * @param config {@see TmxConfig}
   */
  constructor(public readonly config: TmxSpawnerConfig) {}

  /** @internal */
  private collider(geometry: TmxGeometry<ColliderProps>, scale: XY): Collider {
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

    const collider = new Collider(shape);

    collider.sensor = Boolean(geometry.properties.sensor);

    if (geometry.properties.group) {
      collider.group = parseBitSet(geometry.properties.group);
    }

    if (geometry.properties.mask) {
      collider.mask = parseBitSet(geometry.properties.mask);
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
  public tile(width: number, height: number, shapes: TmxGeometry<ColliderProps>[], pivot: Pivot, scale = new Vec2(1, 1)): RigidBody {
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
  public shape(geometry: TmxGeometry<ColliderProps>, scale = new Vec2(1, 1)): RigidBody {
    const collider = this.collider(geometry, scale);

    collider.shape.x = 0;
    collider.shape.y = 0;

    return new RigidBody().attach(collider);
  }

}
