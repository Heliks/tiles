import { Circle, Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { TmxGeometryData } from '../tmx';
import { HasCustomType, parseCustomType } from './custom-type';
import { HasProperties, parseCustomProperties } from './tmx-properties';


/**
 * Contains information about geometry. Colliders attached to a tile, freely placed
 * shapes in an object layer, etc. are all considered geometry objects.
 *
 * - `P`: Custom properties.
 * - `S`: Geometric shape.
 * - `T`: Custom type.
 */
export interface TmxGeometry<
  P = {},
  S extends ColliderShape = ColliderShape,
  T extends string = string> extends HasProperties<P>, HasCustomType<T> {

  /** Unique identifier. */
  readonly id: number;

  /** Custom name. */
  readonly name: string;

  /** Geometrical shape. */
  readonly shape: S;

}

/** @internal */
function createShape(data: TmxGeometryData): ColliderShape {
  if (data.ellipse) {
    // We do not support ellipses, hence why we convert them to circles. Calculate the
    // radius based on the larger of the two sides of the ellipsis.
    const radius = Math.max(data.width, data.height) / 2;

    return new Circle(
      radius,
      data.x + radius,
      data.y + radius
    );
  }

  return new Rectangle(
    data.width,
    data.height,
    data.x + (data.width / 2),
    data.y + (data.height / 2)
  );
}

/** Parses {@link TmxGeometryData geometry data}. */
export function parseGeometryData(data: TmxGeometryData): TmxGeometry {
  return {
    id: data.id,
    name: data.name,
    properties: parseCustomProperties(data),
    shape: createShape(data),
    type: parseCustomType(data)
  };
}
