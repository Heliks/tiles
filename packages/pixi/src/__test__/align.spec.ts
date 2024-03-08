import { Vec2 } from '@heliks/tiles-engine';
import { Align, alignTo } from '../align';


describe('Align', () => {
  let pos: Vec2;

  beforeEach(() => {
    // Note: We always assume that the input position is aligned as Align.Center.
    pos = new Vec2(0, 0);
  });

  test.each([
    { name: 'left',         align: Align.Left,        expected: new Vec2(-5, 0) },
    { name: 'right',        align: Align.Right,       expected: new Vec2(5, 0) },
    { name: 'top',          align: Align.Top,         expected: new Vec2(0, -5) },
    { name: 'top left',     align: Align.TopLeft,     expected: new Vec2(-5, -5) },
    { name: 'top right',    align: Align.TopRight,    expected: new Vec2(5, -5) },
    { name: 'bottom',       align: Align.Bottom,      expected: new Vec2(0, 5) },
    { name: 'bottom left',  align: Align.BottomLeft,  expected: new Vec2(-5, 5) },
    { name: 'bottom right', align: Align.BottomRight, expected: new Vec2(5, 5) },
  ])('should align to $name', ({ align, expected }) => {
    const position = alignTo(pos, 10, 10, align);

    expect(position.x).toBe(expected.x);
    expect(position.y).toBe(expected.y);
  });
});
