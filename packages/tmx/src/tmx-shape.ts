import { Circle, Rectangle } from '@heliks/tiles-engine';
import { ColliderShape } from '@heliks/tiles-physics';
import { parseCustomProperties, HasProperties, TmxProperties } from './tmx-properties';
import { TmxShapeData } from './tmx';
import { getCustomType } from './utils';


/**
 * A geometry object created from TMX data. Most commonly they are created from freely
 * placed shapes in object layers or as colliders that are attached to a game object.
 *
 * - `P`: Custom properties.
 * - `S`: Shape kind.
 */
export class TmxShape<
  P extends TmxProperties = TmxProperties,
  S extends ColliderShape = ColliderShape> implements HasProperties<P> {

  /**
   * @param id Tiled object ID.
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
export function parseShape(data: TmxShapeData, tileWidth: number, tileHeight: number): TmxShape {
  // Convert anchor to center. The position also needs to be re-calculated because if
  // the shape exists on an object via the tiled collision editor, we also need to take
  // into account that objects have their origin position at the bottom-center.
  const x = data.x + (data.width / 2) - (tileWidth / 2);
  const y = -tileHeight + data.y + (data.height / 2);

  const shape = data.ellipse
    ? new Circle(Math.max(data.width, data.height) / 2, x, y)
    : new Rectangle(data.width, data.height, x, y);

  return new TmxShape(
    data.id,
    shape,
    parseCustomProperties(data),
    getCustomType(data)
  );
}
