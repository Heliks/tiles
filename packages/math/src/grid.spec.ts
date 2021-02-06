import { Grid } from './grid';

describe('Grid', () => {
  it.each([
    // First row of the grid.
    [0, 0, 0],
    [1, 16, 0],
    // Second row of the grid.
    [5, 0, 16],
    [6, 16, 16]
  ])('should return the position of the cell at index %s', (index, x, y) => {
    const grid = new Grid(5, 5, 16, 16);

    // Get x and y position from cell idnex.
    const pos = grid.pos(index);

    expect(pos).toMatchObject({
      x,
      y
    });
  });

  it.each([
    // First row of the grid.
    [16, 10, 1],
    [13, 13, 0],
    // Second row of the grid.
    [16, 16, 6],
    [19, 21, 6]
  ])('should return the index of the cell at position x:%s y:%s', (x, y, index) => {
    const grid = new Grid(5, 5, 16, 16);

    // Get the index from the given x and y positions.
    const idx = grid.index(x, y);

    expect(idx).toBe(index);
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
