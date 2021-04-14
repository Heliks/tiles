import { Shape } from '@heliks/tiles-tmx';
import { ColliderShape } from '@heliks/tiles-physics';
import { Circle } from '@heliks/tiles-engine';

/**
 * Internal shape types that are recognized by the map loader to provide basic functions
 * like collision out of the box.
 */
export const enum ShapeType {
  /** Shape should be treated as a physics collider. */
  COLLISION = 'collision',
}


/**
 * Uses the given tiled `shape` and creates a `ColliderShape` from it by converting
 * its dimensions from pixel units to in-game units.
 */
export function tmxShapeToColliderShape(shape: Shape<unknown>, us: number): ColliderShape {
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
