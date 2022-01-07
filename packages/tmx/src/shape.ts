import { Circle, Rectangle, Vec2, XY } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { HasProperties, Properties, getProperties } from './properties';
import { TmxShape } from './tmx';
import { getCustomType } from './utils';


/**
 * A basic shape. Most commonly used inside the Tiled collision editor to create
 * colliders for objects but can also appear as freely placed shape on any object layer.
 *
 * @typeparam P Custom shape properties.
 * @typeparam S Shape of the collider.
 */
export class Shape<P extends Properties = Properties, S extends ColliderShape = ColliderShape> implements HasProperties<P> {

  /**
   * @param id Unique object Id that is generated by tiled.
   * @param data The actual physical collider shape.
   * @param properties User defined properties.
   * @param type (optional) User defined type.
   */
  constructor(
    public readonly id: number,
    public readonly data: S,
    public readonly properties: P,
    public readonly type?: string
  ) {}

}

/** Parses TMX shape data. */
export function parseShape(data: TmxShape, tileWidth: number, tileHeight: number): Shape {
  // Convert anchor to center. The position also needs to be re-calculated because if
  // the shape exists on an object via the tiled collision editor, we also need to take
  // into account that objects have their origin position at the bottom-center.
  const x = data.x + (data.width / 2) - (tileWidth / 2);
  const y = -tileHeight + data.y + (data.height / 2);

  const shape = data.ellipse
    ? new Circle(Math.max(data.width, data.height) / 2, x, y)
    : new Rectangle(data.width, data.height, x, y);

  return new Shape(
    data.id,
    shape,
    getProperties(data),
    getCustomType(data)
  );
}
