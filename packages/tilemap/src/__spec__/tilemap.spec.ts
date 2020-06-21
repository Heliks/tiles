import 'reflect-metadata';

import { Tileset } from "../tileset";
import { Tilemap, TilesetItem } from "../tilemap";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NOOP_TILESET = new Tileset(undefined as any, 5, 5, 16, 16);

describe('TilesetItem', () => {
  it('should convert global ids to local ones', () => {
    const item1 = new TilesetItem(NOOP_TILESET, 1);
    const item2 = new TilesetItem(NOOP_TILESET, 55);

    expect(item1.toLocal(1)).toBe(1);
    expect(item1.toLocal(2)).toBe(2);

    expect(item2.toLocal(55)).toBe(1);
    expect(item2.toLocal(56)).toBe(2);
  });
});

describe('Tilemap', () => {
  it('should return the tileset item belonging to a global id', () => {
    const item1 = new TilesetItem(NOOP_TILESET, 1);
    const item2 = new TilesetItem(NOOP_TILESET, 50);

    const tilemap = new Tilemap(0, 0, 0, 0, [], [
      item1,
      item2
    ]);

    expect(tilemap.tileset(23)).toBe(item1);
    expect(tilemap.tileset(58)).toBe(item2);

    // This should be out of bounds for both tileset items.
    expect(() => tilemap.tileset(26)).toThrow();
    expect(() => tilemap.tileset(89)).toThrow();
  });
});
