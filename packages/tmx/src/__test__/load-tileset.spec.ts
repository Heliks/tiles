import { parseTile } from '../load-tileset';
import { Tileset } from '../tileset';


describe('LoadTileset', () => {
  describe('parseTile', () => {
    let tileset: Tileset;

    beforeEach(() => {
      tileset = new Tileset(undefined as any, 1, 16, 16);
    });

    it('should parse tile shapes', () => {
      const data = require('./tilesets/custom-tile-shapes.json');

      // tileId 2
      parseTile(tileset, data.tiles[0]);

      const shapes = tileset.getTileShapes(2);

      expect(shapes).toHaveLength(1);
    });

    it('should parse tile properties', () => {
      const data = require('./tilesets/custom-tile-properties.json');

      // tileId 2
      parseTile(tileset, data.tiles[1]);

      const properties = tileset.getTileProperties<{ foo?: boolean }>(2);

      expect(properties?.foo).toBeTruthy();
    });
  });
});
