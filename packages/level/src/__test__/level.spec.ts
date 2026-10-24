import { Grid } from '@heliks/tiles-engine';
import { Chunk, Level } from '../level';


function createChunk(index: number): Chunk {
  return { index } as Chunk;
}

describe('Level', () => {
  describe('growToPos()', () => {
    let grid: Grid;
    let layout: Grid;
    let level: Level;

    beforeEach(() => {
      grid = new Grid(16, 16, 16, 16);
      layout = new Grid(1, 1, 16, 16);
      level = new Level(grid, layout, {});
    });

    it('should expand layout and grid to accommodate given coordinates', () => {
      level.growToPos(300, 300);

      expect(layout).toMatchObject({
        cols: 2,
        rows: 2
      });

      expect(grid).toMatchObject({
        cols: 32,
        rows: 32
      });
    });

    it('should not expand if given negative coordinates', () => {
      const cols = layout.cols;
      const rows = layout.rows;

      level.growToPos(-10, -10);

      expect(layout).toMatchObject({
        cols,
        rows
      });
    });

    it('should trigger reindex with updated dimensions', () => {
      const onReindex = jest.spyOn(level, 'reindex');

      level.growToPos(50, 50);

      expect(onReindex).toHaveBeenCalled();
    });
  });

  describe('reindex()', () => {
    let chunk1: Chunk;
    let chunk2: Chunk;
    let chunk3: Chunk;
    let chunk4: Chunk;

    beforeEach(() => {
      chunk1 = createChunk(0);
      chunk2 = createChunk(1);
      chunk3 = createChunk(2);
      chunk4 = createChunk(3);
    });

    it('should do nothing if columns did not change', () => {
      // Same number of columns, different rows
      const grid1 = new Grid(2, 2);
      const grid2 = new Grid(2, 3);
      const level = new Level(grid1, grid1, {});

      // This chunk order is intentionally wrong. If we successfully do nothing, this
      // order should remain the same.
      chunk1.index = 10;
      chunk2.index = 11;
      chunk3.index = 12;
      chunk4.index = 13;

      level.reindex(grid2);

      // No changes made to chunks
      expect(chunk1.index).toBe(10);
      expect(chunk2.index).toBe(11);
      expect(chunk3.index).toBe(12);
      expect(chunk4.index).toBe(13);
    });

    it('should reindex chunks', () => {
      const prev = new Grid(2, 2);
      const next = new Grid(3, 2);

      const level = new Level(prev, next, {});

      level.chunks.push(
        chunk1,
        chunk2,
        chunk3,
        chunk4
      );

      level.reindex(prev);

      expect(chunk1.index).toBe(0);
      expect(chunk2.index).toBe(1);
      expect(chunk3.index).toBe(3);
      expect(chunk4.index).toBe(4);
    });
  });
});

