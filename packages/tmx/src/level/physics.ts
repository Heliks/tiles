import { Collider, RigidBody } from '@heliks/tiles-physics';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { Geometry } from './geometry';
import { CustomTile } from './tmx-tileset';


/**
 * Properties found on shape {@link TmxGeometry geometry} that is supposed to be
 * parsed into a {@link Collider}.
 */
export interface PhysicsProps {

  $collider?: {
    /** @see Collider.group */
    group?: number;
    /** @see Collider.mask */
    mask?: number;
    /** @see Collider.sensor */
    sensor?: boolean;
  };

}

/**
 * Creates a {@link Collider} using the geometry.
 *
 * @param geometry Geometry used to create the collider.
 * @param scale Scale in which the collider is created.
 * @param us Unit size.
 */
export function createPhysicsCollider(geometry: Geometry<PhysicsProps>, scale: number): Collider {
  const collider = new Collider(
    geometry
      .shape
      .clone()
      .scale(scale)
  );

  const props = geometry.props.$collider;

  if (props) {
    collider.sensor = Boolean(props.sensor);

    if (props.group && props.group > -1) {
      collider.group = props.group;
    }

    if (props.mask && props.mask > -1) {
      collider.mask = props.mask;
    }
  }

  return collider;
}

export function createRigidBody(geometries: Geometry<PhysicsProps>[], scale: number) {
  const body = new RigidBody();

  for (const geometry of geometries) {
    const collider = createPhysicsCollider(geometry, scale);

    // Position shape based on tile pivot.
    // collider.shape.x = (geometry.shape.x - (width * pivot.x)) / this.config.unitSize;
    // collider.shape.y = (geometry.shape.y - (height * pivot.y)) / this.config.unitSize;

    body.attach(collider);
  }

  return body;
}

/**
 * Returns the geometry for the given `tile`, or `undefined` if it doesn't have any.
 *
 * @param local Local tileset where the tile exists.
 * @param index Index of the tile for which the geometry is returned.
 */
export function getTileGeometry(local: LocalTileset, index: number): Geometry<PhysicsProps>[] | undefined {
  const tile = local.tileset.tile<CustomTile<unknown, PhysicsProps>>(index);

  if (tile && tile.shapes && tile.shapes.length > 0) {
    return tile.shapes;
  }
}
