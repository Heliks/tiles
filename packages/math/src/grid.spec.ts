import { Grid } from './grid';

describe('Grid', () => {
  const cases = [
    // First row in the grid.
    [0, 0, 0],
    [1, 16, 0],
    // Second row in the grid.
    [5, 0, 16],
    [6, 16, 16]
  ];

  it.each(cases)('should calculate the position of cell index %s', (index, x, y) => {
    const grid = new Grid(5, 5, 16, 16);
    const pos = grid.pos(index);

    expect(pos.x).toBe(x);
    expect(pos.y).toBe(y);
  });

  it('should have a size equal to its amount of total cells', () => {
    expect(new Grid(10, 10, 16, 16).size).toBe(100);
  });

  it('should convert top-left aligned positions to center-aligned', () => {
    const grid = new Grid(5, 5, 16, 16);

    // Probe first (0) and second (6) row.
    const pos1 = grid.toCenter(grid.pos(0));
    const pos2 = grid.toCenter(grid.pos(6));

    expect(pos1.x).toBe(8);
    expect(pos1.y).toBe(8);

    expect(pos2.x).toBe(24);
    expect(pos2.y).toBe(24);
  });
});
