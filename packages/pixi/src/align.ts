import { Vec2, XY } from '@heliks/tiles-engine';

// Todo: Rename this
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
 * Realigns the position `pos` to a rectangle which boundaries are defined by `width`
 * and `height`. The original alignment of `pos` is assumed to be `Align.Center`.
 *
 *
 * @param pos Position that should be realigned.
 * @param width Width of the box boundary.
 * @param height Height of the box boundary.
 * @param align Alignment to the box.
 * @param out (optional) Vector to which the result should be written to.
 */
export function alignTo(pos: XY, width: number, height: number, align: Align, out: XY = new Vec2(0, 0)): XY {
  out.x = pos.x;
  out.y = pos.y;

  switch (align) {
    case Align.Left:
      out.x -= width >> 1;
      break;
    case Align.Right:
      out.x += width >> 1;
      break;
    case Align.Top:
      out.y -= height >> 1;
      break;
    case Align.TopLeft:
      out.x -= width >> 1;
      out.y -= height >> 1;
      break;
    case Align.TopRight:
      out.x += width >> 1;
      out.y -= height >> 1;
      break;
    case Align.Bottom:
      out.y += height >> 1;
      break;
    case Align.BottomLeft:
      out.x -= width >> 1;
      out.y += height >> 1;
      break;
    case Align.BottomRight:
      out.x += width >> 1;
      out.y += height >> 1;
      break;
  }

  return out;
}
