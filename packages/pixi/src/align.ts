import { Vec2, vec2 } from '@heliks/tiles-engine';

export enum Align {
  Center,
  Left,
  Top,
  TopLeft,
  TopRight,
  Right,
  Bottom,
  BottomLeft,
  BottomRight
}

/**
 * Realigns the given position `pos` to the given `box` boundaries, where the `x` axis
 * of the `box` vector represents its width, and the `y` axis its height. The original
 * alignment of the position is assumed to be `Align.Center`.
 *
 * @param pos Position that should be re-aligned.
 * @param box Box to which `pos` should be aligned to.
 * @param align Alignment to the box.
 * @param out (optional) Vector to which the result should be written to.
 */
export function alignTo(pos: Vec2, box: Vec2, align: Align, out = vec2(0, 0)): Vec2 {
  out.x = pos.x;
  out.y = pos.y;

  switch (align) {
    case Align.Left:
      out.x -= box.x >> 1;
      break;
    case Align.Right:
      out.x += box.x >> 1;
      break;
    case Align.Top:
      out.y -= box.y >> 1;
      break;
    case Align.TopLeft:
      out.x -= box.x >> 1;
      out.y -= box.y >> 1;
      break;
    case Align.TopRight:
      out.x += box.x >> 1;
      out.y -= box.y >> 1;
      break;
    case Align.Bottom:
      out.y += box.y >> 1;
      break;
    case Align.BottomLeft:
      out.x -= box.x >> 1;
      out.y += box.y >> 1;
      break;
    case Align.BottomRight:
      out.x += box.x >> 1;
      out.y += box.y >> 1;
      break;
  }

  return out;
}
