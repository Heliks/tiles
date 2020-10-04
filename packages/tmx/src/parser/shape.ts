import { Circle, Rectangle } from '@heliks/tiles-math';
import { Shape as PhysicsShape } from '@heliks/tiles-physics';

/** TMX JSON format for shapes. */
export interface TmxShape {
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
 * A basic shape. Most commonly used inside the Tiled collision editor to create colliders
 * for certain objects but can also appear as freely placed shape on an object layer.
 */
export class Shape {

  /**
   * @param data Any physics shape that can be converted into a collider.
   * @param type The type of shape, or rather what the shape should be. Use this to
   *  determine how to treat this shape in-game.
   */
  constructor(
    public readonly data: PhysicsShape,
    public readonly type?: string
  ) {}

}

/** Parses TMX shape data. */
export function tmxParseShape(data: TmxShape, tileWidth: number, tileHeight: number): Shape {
  let shape;

  // Convert object anchor to center. If the shape was placed with the Tiled collision
  // editor we also need to re-position it based on the center of the tile on which it
  // was placed on.
  const x = data.x + (data.width / 2) - (tileWidth / 2);
  const y = data.y + (data.height / 2) - (tileHeight / 2);

  if (data.ellipse) {
    // The engine only supports circles so we need to convert ellipses. We use the larger
    // of the two sides and calculate a radius from it.
    shape = new Circle(Math.max(data.width, data.height) / 2, x, y);
  }
  else {
    shape = new Rectangle(data.width, data.height, x, y);
  }

  return new Shape(shape, data.type);
}
