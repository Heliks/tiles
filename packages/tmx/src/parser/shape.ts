import { Circle, Rectangle } from '@heliks/tiles-math';
import { MaterialId, Shape as PhysicsShape } from '@heliks/tiles-physics';
import { HasTmxPropertyData, tmxParseProperties } from './properties';

/** TMX JSON format for shapes. */
export interface TmxShape extends HasTmxPropertyData {
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

/** Properties that can possible occur on a shape. */
export interface ShapeProperties {
  /**
   * If the shape is a collider that is part of a rigid-body this will be assigned
   * as it's `Material`
   */
  physicsMaterial?: MaterialId;
}

/**
 * A basic shape. Most commonly used inside the Tiled collision editor to create colliders
 * for certain objects but can also appear as freely placed shape on an object layer.
 */
export class Shape {

  /**
   * @param data Any physics shape that can be converted into a collider.
   * @param type The type of shape, or rather what the shape should be. Use this to
   *  determine how to treat this shape in-game.
   * @param properties Additional shape properties.
   */
  constructor(
    public readonly data: PhysicsShape,
    public readonly type: string,
    public readonly properties: ShapeProperties
  ) {}

}

/** Parses TMX shape data. */
export function tmxParseShape(data: TmxShape, tileWidth: number, tileHeight: number): Shape {
  // Convert object anchor to center. We also need to re-position the object because
  // the position *can* be relative to a tile if the shape was defined via the
  // collision editor.
  const x = data.x + (data.width / 2) - (tileWidth / 2);
  const y = data.y + (data.height / 2) - (tileHeight / 2);

  const shape = data.ellipse
    ? new Circle(Math.max(data.width, data.height) / 2, x, y)
    : new Rectangle(data.width, data.height, x, y);

  return new Shape(shape, data.type, tmxParseProperties(data));
}
