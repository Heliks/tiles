import { Grid } from '../grid';
import { Vec2 } from '../vec2';


describe('Grid', () => {
  it.each([
    // First row of the grid.
    [0, 0, 0],
    [1, 16, 0],
    // Second row in the grid.
    [5, 0, 16],
    [6, 16, 16]
  ])('should return the position of the cell at index %s', (index, x, y) => {
    const grid = new Grid(5, 5, 16, 16);

    // Get x and y position from cell idnex.
    const pos = grid.getPosition(index);

    expect(pos).toMatchObject({
      x,
      y
    });
  });

  describe('when returning a cell index', () => {
    let grid: Grid;

    beforeEach(() => {
      grid = new Grid(5, 5, 16, 16);
    });

    it.each([
      [0, 0, 0],
      [1, 1, 6],
      [5, 5, 24],
      [-1, -1, 0],
      [6, 1, 9]
    ])('grid location col %s row %s should return cell index %s', (col, row, cell) => {
      expect(grid.getIndex(col, row)).toBe(cell);
    });

    it.each([
      [16, 10, 1],
      [13, 13, 0],
      [16, 16, 6],
      [19, 21, 6]
    ])('should return index of cell at position x:%s y:%s', (x, y, index) => {
      expect(grid.getIndexAt(x, y)).toBe(index);
    });
  });

  it.each([
    [-1, false],
    [0, true],
    [1, true],
    [99, true],
    [100, false]
  ])('should check if cell index %i is in bounds of a 10x10 grid', (cell, expected) => {
    expect(new Grid(10, 10, 16, 16).isIndexInBounds(cell)).toBe(expected);
  });

  it.each([
    {
      position: new Vec2(0, 0),
      expected: true
    },
    {
      position: new Vec2(-1, 0),
      expected: false
    },
    {
      position: new Vec2(0, -1),
      expected: false
    },
    {
      position: new Vec2(10, 10),
      expected: true
    },
    {
      position: new Vec2(50, 51),
      expected: false
    },
    {
      position: new Vec2(51, 50),
      expected: false
    },
  ])('should check if position x: $position.x y: $position.y is in bounds', data => {
    const result = new Grid(10, 10, 5, 5).isPositionInBounds(
      data.position.x,
      data.position.y
    );

    expect(result).toBe(data.expected);
  });

  it('should have a size equal to its amount of total cells', () => {
    expect(new Grid(10, 10, 16, 16).size).toBe(100);
  });
});

