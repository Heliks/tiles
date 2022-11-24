import { createPackedArray, Grid } from '@heliks/tiles-engine';
import { Tilemap } from '../tilemap';


describe('Tilemap', () => {
  let tilemap: Tilemap;

  beforeEach(() => {
    tilemap = new Tilemap(new Grid(10, 10, 16, 16));
  });

  describe('when setting a tile id', () => {
    it('should return true if data was changed', () => {
      expect(tilemap.set(10, 5)).toBeTruthy();
    });

    it('should return false if no data was changed', () => {
      tilemap.set(10, 5);

      const changed = tilemap.set(10, 5);

      expect(changed).toBeFalsy();
    });

    it.each([
      -1,
      100,
      101
    ])('should not change data for out of bounds cell %i', cell => {
      expect(tilemap.set(cell, 1)).toBeFalsy();
    });

    it('should mark tilemap as dirty if data was changed', () => {
      tilemap.set(10, 5);

      expect(tilemap.dirty).toBeTruthy();
    });
  });

  describe('when overwriting tile data', () => {
    it('should overwrite tile data', () => {
      const data = createPackedArray(100, 5);

      tilemap.setAll(data);

      expect(tilemap.data).toEqual(data);
    });

    it('should mark tilemap as dirty', () => {
      tilemap.setAll(createPackedArray(100, 0));

      expect(tilemap.dirty).toBeTruthy();
    });

    it('should throw if new data is not equal to the size of the tilemap', () => {
      expect(() => {
        tilemap.setAll(createPackedArray(5, 0));
      }).toThrow();
    });
  });
});
