import { Grid } from '@heliks/tiles-engine';
import { Tilemap } from '../tilemap';


describe('Tilemap', () => {
  describe('when setting a tile id', () => {
    let tilemap: Tilemap;

    beforeEach(() => {
      tilemap = new Tilemap(new Grid(10, 10, 16, 16));
    });

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
});
