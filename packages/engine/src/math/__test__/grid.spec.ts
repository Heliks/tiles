import { Grid } from "../grid";

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

});