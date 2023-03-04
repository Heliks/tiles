import { PivotPreset } from '../pivot-preset';


describe('Pivot', () => {
  it.each([
    { pivot: PivotPreset.BOTTOM, x: 50, y: 100 },
    { pivot: PivotPreset.BOTTOM_LEFT, x: 0, y: 100 },
    { pivot: PivotPreset.BOTTOM_RIGHT, x: 100, y: 100 },
    { pivot: PivotPreset.TOP, x: 50, y: 0 },
    { pivot: PivotPreset.TOP_LEFT, x: 0, y: 0 },
    { pivot: PivotPreset.TOP_RIGHT, x: 100, y: 0 },
    { pivot: PivotPreset.LEFT, x: 0, y: 50 },
    { pivot: PivotPreset.RIGHT, x: 100, y: 50 },
    { pivot: PivotPreset.CENTER, x: 50, y: 50 }
  ])('$pivot should set pivot to x: $x y: $y px', data => {
    const pivot = data.pivot.getPosition(100, 100);

    expect(pivot).toMatchObject({
      x: data.x,
      y: data.y
    });
  });
});
