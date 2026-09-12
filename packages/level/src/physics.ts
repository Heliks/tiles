import { Collider, RigidBody } from '@heliks/tiles-physics';
import { LocalTileset } from '@heliks/tiles-tilemap';
import { Geometry } from './geometry';
import { ObjectBodyConfig } from './objects';
import { CustomTile } from './tileset';


export interface PhysicsColliderProps {
  /** @see Collider.group */
  group?: number;
  /** @see Collider.mask */
  mask?: number;
  /** @see Collider.sensor */
  sensor?: boolean;
  density?: number;
  friction?: number;
  restitution?: number;
}

/**
 * Properties found on shape {@link TmxGeometry geometry} that is supposed to be
 * parsed into a {@link Collider}.
 */
export interface PhysicsProps {
  $collider?: PhysicsColliderProps;
}

/**
 * Creates a {@link Collider} using the geometry.
 *
 * @param geometry Geometry used to create the collider.
 * @param scale Scale in which the collider is created.
 */
export function createPhysicsCollider(geometry: Geometry<PhysicsProps>, scale = 1): Collider {
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

export function createPhysicsCollider2(geometry: Geometry<PhysicsColliderProps>, scale = 1): Collider {
  const collider = new Collider(
    geometry
      .shape
      .clone()
      .scale(scale)
  );

  const props = geometry.props;

  collider.sensor = Boolean(props.sensor);

  if (props.group && props.group > -1) {
    collider.group = props.group;
  }

  if (props.mask && props.mask > -1) {
    collider.mask = props.mask;
  }

  const density = props.density ?? 0;
  const friction = props.friction ?? 0;
  const restitution = props.restitution ?? 0;

  collider.material = {
    density,
    friction,
    restitution
  }

  return collider;
}

export function createRigidBody(geometries: Geometry<PhysicsColliderProps>[], scale: number, config?: ObjectBodyConfig): RigidBody {
  const body = new RigidBody(config?.type);

  if (config) {
    console.log(config.damping)
    body.dampen(config.damping);
  }

  for (const geometry of geometries) {
    body.attach(createPhysicsCollider2(geometry, scale));
  }

  return body;
}

/**
 * Returns the geometry for the given `tile`, or `undefined` if it doesn't have any.
 *
 * @param local Local tileset where the tile exists.
 * @param index Index of the tile for which the geometry is returned.
 */
export function getTileGeometry(local: LocalTileset, index: number): Geometry<PhysicsColliderProps>[] | undefined {
  const tile = local.tileset.tile<CustomTile<{}, PhysicsColliderProps>>(index);

  if (tile && tile.shapes && tile.shapes.length > 0) {
    return tile.shapes;
  }
}
