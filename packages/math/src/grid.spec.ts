import { Grid } from './grid';
import { Vec2 } from './vec2';

describe('Grid', () => {
  it.each([
    // Row 1:
    [0, 0, 0],
    [1, 16, 0],
    // Row 2:
    [5, 0, 16],
    [6, 16, 16],
    // Negative numbers:
    [-1, -16, 0],
    [-6, -16, -16]
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
    // Row 1:
    [16, 10, 1],
    [13, 13, 0],
    // Row 2:
    [16, 16, 6],
    [19, 21, 6],
    // Negative numbers:
    [-13, -13, 0],
    [-19, -21, -6]
  ])('should return the index of the cell at position x:%s y:%s', (x, y, index) => {
    const grid = new Grid(5, 5, 16, 16);

    // Get the index from the given x and y positions.
    const idx = grid.index(x, y);

    expect(idx).toBe(index);
  });

  it('should have a size equal to its amount of total cells', () => {
    expect(new Grid(10, 10, 16, 16).size).toBe(100);
  });

  it.each([
    [{ x: 16, y: 16 }, 24, 24],
    [{ x: -16, y: -16 }, -24, -24]
  ])('should convert top-left aligned position %s to center-aligned', (pos: Vec2, x, y) => {
    const grid = new Grid(5, 5, 16, 16);

    grid.toCenter(pos);

    expect(pos.x).toBe(x);
    expect(pos.y).toBe(y);
  });
});
