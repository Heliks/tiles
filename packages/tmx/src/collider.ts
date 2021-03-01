import { Shape } from './parser';
import { ColliderShape } from '@heliks/tiles-physics';
import { Circle } from '@heliks/tiles-engine';

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
