import { Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';


/**
 * Defines various geometric elements within a {@link Level}, including:
 *
 * - Colliders attached to tiles and other entities
 * - Shape entities.
 *
 * @template `P`: Custom properties
 * @template `S`: Geometric shape.
 * @template `T`: Custom type.
 */
export interface Geometry<P = {}, S extends ColliderShape = ColliderShape, T extends string = string> {
  /** Unique identifier. */
  id: number;
  /** Custom name. */
  name: string;
  /** The physical shape of the geometry. */
  shape: S;
  /** Custom properties. */
  props: P;
  /** Custom type. */
  type?: T;
}

/**
 * Returns `true` if the given `geometry` is point geometry (aka a rectangle with a
 * width and height of `0`.
 */
export function isPointGeometry(geometry: Geometry): boolean {
  return geometry.shape instanceof Rectangle
    && geometry.shape.width === 0
    && geometry.shape.height === 0;
}
