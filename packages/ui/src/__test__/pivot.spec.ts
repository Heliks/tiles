import {
  getPivotPosition,
  PIVOT_BOTTOM,
  PIVOT_BOTTOM_LEFT,
  PIVOT_BOTTOM_Right, PIVOT_LEFT, PIVOT_RIGHT,
  PIVOT_TOP,
  PIVOT_TOP_LEFT, PIVOT_TOP_Right
} from '../pivot';


describe('Pivot', () => {
  it.each([
    { pivot: PIVOT_BOTTOM, x: 50, y: 100 },
    { pivot: PIVOT_BOTTOM_LEFT, x: 0, y: 100 },
    { pivot: PIVOT_BOTTOM_Right, x: 100, y: 100 },

    { pivot: PIVOT_TOP, x: 50, y: 0 },
    { pivot: PIVOT_TOP_LEFT, x: 0, y: 0 },
    { pivot: PIVOT_TOP_Right, x: 100, y: 0 },

    { pivot: PIVOT_LEFT, x: 0, y: 50 },
    { pivot: PIVOT_RIGHT, x: 100, y: 50 }
  ])('$pivot should set pivot to x: $x y: $y px', data => {
    const pivot = getPivotPosition(data.pivot, 100, 100);

    expect(pivot).toMatchObject({
      x: data.x,
      y: data.y
    });
  });
});
