import { Vec2, vec2 } from '@heliks/tiles-engine';
import { Align, alignTo } from '../align';


describe('Align', () => {
  let pos: Vec2;

  beforeEach(() => {
    // Note: We always assume that the input position is aligned as Align.Center.
    pos = vec2(0, 0);
  });

  test.each([
    { name: 'left',         align: Align.Left,        expected: vec2(-5, 0) },
    { name: 'right',        align: Align.Right,       expected: vec2(5, 0) },
    { name: 'top',          align: Align.Top,         expected: vec2(0, -5) },
    { name: 'top left',     align: Align.TopLeft,     expected: vec2(-5, -5) },
    { name: 'top right',    align: Align.TopRight,    expected: vec2(5, -5) },
    { name: 'bottom',       align: Align.Bottom,      expected: vec2(0, 5) },
    { name: 'bottom left',  align: Align.BottomLeft,  expected: vec2(-5, 5) },
    { name: 'bottom right', align: Align.BottomRight, expected: vec2(5, 5) },
  ])('should align to $name', ({ align, expected }) => {
    expect(alignTo(pos, 10, 10, align)).toMatchObject(expected);
  });
});
