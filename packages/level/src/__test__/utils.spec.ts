import { Grid } from '@heliks/tiles-engine';
import { getCellsFromDistance } from '../utils';


describe('getCellsFromDistance()', () => {
  const grid = new Grid(10, 10);

  it('should return all cells within a distance of 2', () => {
    const result = getCellsFromDistance(grid, 4, 3, 2);

    result.sort();

    expect(result).toEqual([
              14,
          23, 24, 25,
      32, 33, 34, 35, 36,
          43, 44, 45,
              54
    ]);
  });

  it('should exclude cells outside of grid boundaries', () => {
    const result = getCellsFromDistance(grid, 0, 3, 2);

    result.sort();

    expect(result).toEqual([
      10,
      20, 21,
      30, 31, 32,
      40, 41,
      50
    ]);
  });
});
