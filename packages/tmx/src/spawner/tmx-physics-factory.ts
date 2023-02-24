import { TmxGeometry } from '../parser';
import { Injectable, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { TmxSpawnerConfig } from './tmx-spawner-config';
import { Collider, RigidBody } from '@heliks/tiles-physics';


/** Creates physics components from {@link TmxGeometry Tiled geometry}. */
@Injectable()
export class TmxPhysicsFactory {

  /**
   * @param config {@see TmxConfig}
   */
  constructor(public readonly config: TmxSpawnerConfig) {}

  /** Creates a {@link Collider} from {@link TmxGeometry}. */
  public collider(geometry: TmxGeometry, scale: XY = new Vec2(1, 1)): Collider {
    let x = geometry.shape.x;
    let y = geometry.shape.y;

    let shape;

    if (geometry.shape instanceof Rectangle) {
      shape = geometry
        .shape
        .copy()
        .scale(scale);
    }
    else {
      shape = geometry
        .shape
        .copy()
        .scale(Math.max(scale.x, scale.y))
    }

    shape.scale(1 / this.config.unitSize);

    shape.x = x / this.config.unitSize;
    shape.y = y / this.config.unitSize;

    return new Collider(shape);
  }

  /**
   * Creates a {@link RigidBody} component from {@link TmxGeometry}.
   *
   * The position of the physics {@link Collider} that is created from the geometry is
   * always 0/0. This is because we assume that the entity to which the rigid body will
   * be attached to, is positioned via a {@link Transform} component.
   */
  public body(geometry: TmxGeometry, scale?: XY): RigidBody;

  /** Creates a {@link RigidBody} component from {@link TmxGeometry}. */
  public body(geometry: TmxGeometry[], scale?: XY): RigidBody;

  /** @internal */
  public body(geometry: TmxGeometry | TmxGeometry[], scale = new Vec2(1, 1)): RigidBody {
    const body = new RigidBody();

    if (Array.isArray(geometry)) {
      for (const item of geometry) {
        body.attach(this.collider(item, scale));
      }
    }
    else {
      const collider = this.collider(geometry, scale);

      // Assume entity that receives this component is positioned correctly via a
      // transform component.
      collider.shape.x = 0;
      collider.shape.y = 0;

      body.attach(collider);
    }

    return body;
  }

}
