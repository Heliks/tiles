import { Circle, Rectangle } from '@heliks/tiles-math';
import { ColliderShape, MaterialId } from '@heliks/tiles-physics';
import { HasTmxPropertyData, tmxParseProperties, TmxProperties } from './properties';

/** TMX JSON format for shapes. */
export interface TmxShapeData extends HasTmxPropertyData {
  ellipse?: boolean;
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

/**
 * A basic shape. Most commonly used inside the Tiled collision editor to create
 * colliders for certain objects but can also appear as freely placed shape on any
 * object layer.
 *
 * @typeparam P Custom properties added to the shape.
 * @typeparam T Allowed custom types.
 */
export class Shape<P = TmxProperties, T = string> {

  /**
   * @param id Unique object Id that is generated by tiled.
   * @param data The actual physical collider shape.
   * @param type The type of shape, or rather what the shape should be. Use this to
   *  determine how to treat this shape in-game.
   * @param properties Additional shape properties.
   */
  constructor(
    public readonly id: number,
    public readonly data: ColliderShape,
    public readonly type: T,
    public readonly properties: P
  ) {}

}

/** Parses TMX shape data. */
export function tmxParseShape(data: TmxShapeData, tileWidth: number, tileHeight: number): Shape {
  // Convert object anchor to center. We also need to re-position the object because
  // the position *can* be relative to a tile if the shape was defined via the
  // collision editor.
  const x = data.x + (data.width / 2) - (tileWidth / 2);
  const y = data.y + (data.height / 2) - (tileHeight / 2);

  const shape = data.ellipse
    ? new Circle(Math.max(data.width, data.height) / 2, x, y)
    : new Rectangle(data.width, data.height, x, y);

  return new Shape(data.id, shape, data.type, tmxParseProperties(data));
}
