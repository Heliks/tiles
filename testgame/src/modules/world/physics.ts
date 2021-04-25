import { Shape, Tileset } from '@heliks/tiles-tmx';
import { ColliderShape, RigidBody, RigidBodyType } from '@heliks/tiles-physics';
import { Circle } from '@heliks/tiles-engine';

/** Internal shape types that are recognized by the map loader. */
export const enum ShapeType {
  /** Shape should be treated as a physics collider. */
  COLLISION = 'collision',
}

/**
 * Options for the rigid body that will be created if an object has any collider
 * shapes attached.
 */
export interface RigidBodyProperties {
  physicsBodyType?: RigidBodyType;
}

/** Properties on a collider shape. */
export interface ColliderProperties {
  physicsMaterial?: string;
}

/**
 * Uses the given tiled `shape` and creates a `ColliderShape` from it by converting
 * its dimensions from pixel units to in-game units.
 */
export function shapeToCollider(shape: Shape<unknown>, us: number): ColliderShape {
  const data = shape.data.copy();

  data.x /= us;
  data.y /= us;

  if (data instanceof Circle) {
    data.radius /= us;
  }
  else {
    data.height /= us;
    data.width /= us;
  }

  return data;
}

/** @internal */
export function createRigidBody(tileset: Tileset, tileId: number, us: number, properties: RigidBodyProperties): RigidBody | undefined {
  // Get all collider type shapes.
  const colliders = tileset.getTileShapesByType<ColliderProperties>(tileId, ShapeType.COLLISION);

  // If we found any collision shapes we add a rigid body to the object, using the
  // shapes as colliders.
  if (colliders && colliders.length > 0) {
    const body = new RigidBody(properties.physicsBodyType);

    for (const shape of colliders) {
      body.attach(shapeToCollider(shape, us), {
        material: shape.properties.physicsMaterial as any
      });
    }

    return body;
  }

}
