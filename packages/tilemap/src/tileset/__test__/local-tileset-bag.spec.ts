import { LocalTilesetBag } from '../local-tileset-bag';
import { LocalTileset } from '../local-tileset';
import { Grid } from '@heliks/tiles-engine';
import { Tileset } from '../tileset';
import { createEmptyTileset } from './utils';


describe('LocalTilesetBag', () => {
  function createTileset(cols: number, rows: number): Tileset {
    return createEmptyTileset(new Grid(cols, rows, 16, 16));
  }

  describe('get next first Id', () => {
    it('should return 1 if the bag is empty', () => {
      expect(new LocalTilesetBag().getNextFirstId()).toBe(1);
    });

    it('should return the next first ID', () => {
      const bag = new LocalTilesetBag();

      // This tileset has 9 16x16px tiles.
      const tileset = createTileset(3, 3);

      bag.set(new LocalTileset(tileset, 1));

      expect(bag.getNextFirstId()).toBe(10);
    });
  });

  it('should add tilesets', () => {
    const bag = new LocalTilesetBag();

    const tileset1 = createTileset(3, 3);
    const tileset2 = createTileset(3, 3);

    bag.add(tileset1);

    const nextId = bag.getNextFirstId();
    const local = bag.add(tileset2);

    expect(local.tileset).toBe(tileset2);
    expect(local.firstId).toBe(nextId);
  });

  describe('return a local tileset from a global tile Id', () => {
    it.each([
      [1, 0],
      [9, 0],
      [10, 1],
      [15, 1]
    ])('should return the local tileset ID: %i Tileset Index: %i', (id: number, index: number) => {
      const bag = new LocalTilesetBag();

      bag.add(createTileset(3, 3));
      bag.add(createTileset(3, 3));

      const local = bag.getFromGlobalId(id);
      const expected = bag.items[ index ];

      expect(local.tileset).toBe(expected.tileset);
    });

    it('should throw an error if global Id is not in range of a local tileset', () => {
      const bag = new LocalTilesetBag();

      bag.add(createTileset(3, 3));

      expect(() => bag.getFromGlobalId(25)).toThrow();
    });
  });
});
