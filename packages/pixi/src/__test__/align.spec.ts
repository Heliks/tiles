import { Vec2 } from '@heliks/tiles-engine';
import { Align, alignTo } from '../align';


describe('Align', () => {
  let pos: Vec2;

  beforeEach(() => {
    // Note: We always assume that the input position is aligned as Align.Center.
    pos = new Vec2(0, 0);
  });

  test.each([
    { name: 'left',         align: Align.Left,        inner: new Vec2(-5, 0) },
    { name: 'right',        align: Align.Right,       inner: new Vec2(5, 0) },
    { name: 'top',          align: Align.Top,         inner: new Vec2(0, -5) },
    { name: 'top left',     align: Align.TopLeft,     inner: new Vec2(-5, -5) },
    { name: 'top right',    align: Align.TopRight,    inner: new Vec2(5, -5) },
    { name: 'bottom',       align: Align.Bottom,      inner: new Vec2(0, 5) },
    { name: 'bottom left',  align: Align.BottomLeft,  inner: new Vec2(-5, 5) },
    { name: 'bottom right', align: Align.BottomRight, inner: new Vec2(5, 5) },
  ])('should align to $name', ({ align, expected }) => {
    const position = alignTo(pos, 10, 10, align);

    expect(position.x).toBe(expected.x);
    expect(position.y).toBe(expected.y);
  });
});
