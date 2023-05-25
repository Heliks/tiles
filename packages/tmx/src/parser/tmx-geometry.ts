import { ColliderShape } from '@heliks/tiles-physics';
import { HasProperties, parseCustomProperties, TmxProperties } from './tmx-properties';
import { HasCustomType, parseCustomType } from './custom-type';
import { TmxGeometryData } from '../tmx';
import { Circle, Pivot, Rectangle } from '@heliks/tiles-engine';


/**
 * Contains information about geometry. Colliders attached to a tile, freely placed
 * shapes in an object layer, etc. are all considered geometry objects.
 *
 * - `P`: Custom properties.
 * - `S`: Geometric shape.
 */
export interface TmxGeometry<
  P extends TmxProperties = TmxProperties,
  S extends ColliderShape = ColliderShape> extends HasProperties<P>, HasCustomType {

  /** Unique identifier. */
  readonly id: number;

  /** Geometrical shape. */
  readonly shape: S;

}

/** @internal */
function createShape(data: TmxGeometryData): ColliderShape {
  return data.ellipse
    ? new Circle(Math.max(data.width, data.height) / 2, data.x, data.y)
    : new Rectangle(data.width, data.height, data.x, data.y);
}

/**
 * Parses {@link TmxGeometryData geometry data}.
 *
 * Tiled internally treats all geometrical shapes as rectangles anchored at their own
 * top left corner. If a {@link Pivot} is specified, the position of the parsed shape
 * is modified as if the internal rectangle were anchored at that pivot instead.
 *
 * Ellipsis are converted to circles, where the larger of the two sides of the ellipsis
 * will be the circle radius.
 */
export function parseGeometryData(data: TmxGeometryData, pivot?: Pivot): TmxGeometry {
  const shape = createShape(data);

  if (pivot) {
    pivot.getPosition(data.width, data.height, shape);

    shape.x += data.x;
    shape.y += data.y;
  }

  return {
    id: data.id,
    properties: parseCustomProperties(data),
    shape,
    type: parseCustomType(data)
  };
}