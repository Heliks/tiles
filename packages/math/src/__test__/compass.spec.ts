import { Compass, vecToCompass } from '../compass';


describe('Compass', () => {
  describe('vecToCompass()', () => {
    it.each([
      { compass: Compass.N, x: 0, y: -1 },
      { compass: Compass.NE, x: 1, y: -1 },
      { compass: Compass.NW, x: -1, y: -1 },


      { compass: Compass.S, x: 0, y: 1 },
      { compass: Compass.SE, x: 1, y: 1 },
      { compass: Compass.SW, x: -1, y: 1 },

      { compass: Compass.E, x: 1, y: 0 },
      { compass: Compass.W, x: -1, y: 0 }
    ])('should convert unit vector ($x/$y) to compass direction $compass', data => {
      expect(vecToCompass(data)).toBe(data.compass);
    });
  });
});
