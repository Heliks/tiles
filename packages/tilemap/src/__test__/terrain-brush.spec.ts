import { TerrainBrush } from '../terrain-brush';
import { Grid } from '@heliks/tiles-engine';
import { createEmptyTileset } from '../tileset/__test__/utils';
import { LocalTileset, Terrain } from '../tileset';
import { Tilemap } from '../tilemap';


describe('TerrainBrush', () => {
  let brush: TerrainBrush;

  beforeEach(() => {
    const tileset = createEmptyTileset(new Grid(4, 4, 16, 16));
    const terrain = new Terrain('Test')

    terrain
      .set(0, 0)
      .set(1, 1)
      .set(2, 2)
      .set(3, 3)
      .set(4, 4)
      .set(5, 5)
      .set(6, 6)
      .set(7, 7)
      .set(8, 8)
      .set(9, 9)
      .set(10, 10)
      .set(11, 11)
      .set(12, 12)
      .set(13, 13)
      .set(14, 14)
      .set(15, 15);

    brush = new TerrainBrush(new LocalTileset(tileset, 1), terrain);
  });

  it.each([
    {
      expected: false,
      col: 1,
      row: 1,
      data: [
        0, 1, 0,
        1, 0, 1,
        0, 1, 0
      ],
    },
    {
      expected: true,
      col: 0,
      row: 0,
      data: [
        1, 1, 0,
        0, 1, 0,
        1, 1, 0
      ],
    },
    {
      expected: false,
      col: 3,
      row: 0,
      data: [
        1, 1, 0,
        1, 1, 0,
        1, 1, 1
      ],
    },
    {
      expected: false,
      col: -1,
      row: -1,
      data: [
        1, 1, 0,
        1, 1, 0,
        0, 0, 0
      ],
    }
  ])('should check if tile at location $col and $row belongs to terrain', data => {
    const tilemap = new Tilemap(new Grid(3, 3, 16, 16)).setAll(data.data);

    const isTerrain = brush.isTerrainTile(tilemap, data.col, data.row);

    expect(isTerrain).toBe(data.expected);
  });

  it.each([
    {
      terrainId: 15,
      col: 1,
      row: 1,
      data: [
        0, 1, 0,
        1, 0, 1,
        0, 1, 0
      ]
    },
    {
      terrainId: 14,
      col: 1,
      row: 1,
      data: [
        0, 0, 0,
        1, 0, 1,
        0, 1, 0
      ]
    },
    {
      terrainId: 7,
      col: 0,
      row: 1,
      data: [
        1, 1, 0,
        0, 1, 0,
        1, 1, 0
      ],
    },
    {
      terrainId: 8,
      col: 2,
      row: 0,
      data: [
        1, 1, 0,
        1, 1, 0,
        1, 1, 1
      ],
    },
    {
      terrainId: 3,
      col: 0,
      row: 1,
      data: [
        1, 1, 0,
        1, 1, 0,
        0, 0, 0
      ],
    }
  ])('should return $terrainId as terrain ID for location col $col row $row', data => {
    const tilemap = new Tilemap(new Grid(3, 3, 16, 16)).setAll(data.data);

    const idx = brush.getTerrainTileId(
      tilemap,
      data.col,
      data.row
    );

    expect(idx).toEqual(data.terrainId);
  });

  it.each([
    {
      col: 0,
      row: 0,
      data: [
        0, 1, 0,
        1, 1, 0,
        0, 0, 0
      ],
      expected: [
        7, 13, 0,
        4, 1, 0,
        0, 0, 0
      ]
    },
    {
      col: 0,
      row: 1,
      data: [
        1, 1, 0,
        0, 1, 0,
        1, 1, 0
      ],
      expected: [
        7, 1, 0,
        8, 14, 0,
        4, 1, 0
      ]
    },
    {
      col: 1,
      row: 1,
      data: [
        0, 1, 0,
        1, 0, 1,
        0, 1, 0
      ],
      expected: [
        0, 5, 0,
        3, 16, 9,
        0, 2, 0
      ]
    }
  ])('draw terrain at location x: $col y: $row', data => {
    const tilemap = new Tilemap(new Grid(3, 3, 16, 16)).setAll(data.data);

    brush.draw(tilemap, data.col, data.row);

    expect(tilemap.data).toEqual(data.expected);
  });
});
