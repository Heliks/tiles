import { Grid } from './grid';

describe('Grid', () => {
  it('should calculate the position of a cell index', () => {
    const grid = new Grid(5, 5, 16, 16);

    // First row.
    expect(grid.pos(0)).toEqual([ 0, 0 ]);
    expect(grid.pos(1)).toEqual([ 16, 0 ]);

    // After first row.
    expect(grid.pos(5)).toEqual([ 0, 16 ]);
    expect(grid.pos(6)).toEqual([ 16, 16 ]);
  });

  it('should have a size equal to its amount of total cells', () => {
    expect(new Grid(10, 10, 16, 16).size).toBe(100);
  });

  it('should convert top-left aligned positions to center-aligned', () => {
    const grid = new Grid(5, 5, 16, 16);

    expect(grid.toCenter(grid.pos(0))).toEqual([8, 8]);
    expect(grid.toCenter(grid.pos(6))).toEqual([24, 24]);
  });
});
