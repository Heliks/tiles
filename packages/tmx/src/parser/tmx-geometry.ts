import { ColliderShape } from '@heliks/tiles-physics';
import { HasProperties, parseCustomProperties, TmxProperties } from './tmx-properties';
import { HasCustomType, parseCustomType } from './custom-type';
import { TmxShapeData } from '../tmx';
import { Circle, Rectangle } from '@heliks/tiles-engine';


/**
 * A geometry object created from TMX data. Most commonly they are created from freely
 * placed shapes in object layers or as colliders that are attached to a tile.
 *
 * - `P`: Custom properties.
 * - `S`: Shape.
 */
export interface TmxGeometry<
  P extends TmxProperties = TmxProperties,
  S extends ColliderShape = ColliderShape> extends HasProperties<P>, HasCustomType {

  /** Tiled object ID. */
  readonly id: number;

  /** Physical shape. */
  readonly shape: S;

}

/** Parses {@link TmxShapeData shape data} and converts it to a {@link TmxGeometry}. */
export function parseGeometryData(data: TmxShapeData): TmxGeometry {
  let shape;

  if (data.ellipse) {
    // Note: The physics engine does not support ellipsis. Use the larger of two sides
    // as the radius and convert it to a circle. This works for shapes that are actual
    // circles too, as Tiled internally treats them the same as ellipsis.
    shape = new Circle(Math.max(data.width, data.height) / 2, data.x, data.y);
  }
  else {
    shape = new Rectangle(data.width, data.height, data.x, data.y);
  }

  return {
    id: data.id,
    shape,
    properties: parseCustomProperties(data),
    type: parseCustomType(data)
  };
}
