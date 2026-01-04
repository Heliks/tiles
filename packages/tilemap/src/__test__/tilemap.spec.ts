import { Grid } from '@heliks/tiles-engine';
import { Tilemap } from '../tilemap';


describe('Tilemap', () => {
  let tilemap: Tilemap;

  beforeEach(() => {
    tilemap = new Tilemap(new Grid(10, 10, 16, 16));
  });

  describe('set()', () => {
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
    ])('should ignore out of bounds cell %i', cell => {
      expect(tilemap.set(cell, 1)).toBeFalsy();
    });

    it('should mark tilemap as dirty if data was changed', () => {
      tilemap.set(10, 5);

      expect(tilemap.dirty).toBeTruthy();
    });
  });

  describe('setAll()', () => {
    it('should overwrite existing data', () => {
      const data = new Array(100).fill(5);

      tilemap.setAll(data);

      expect(tilemap.data).toEqual(data);
    });

    it('should mark tilemap as dirty', () => {
      const data = new Array(100).fill(0);

      tilemap.setAll(data);

      expect(tilemap.dirty).toBeTruthy();
    });

    it('should throw if there are not enough tiles to fill the entire map', () => {
      expect(() => {
        tilemap.setAll(new Array(5).fill(0));
      }).toThrow();
    });
  });
});
