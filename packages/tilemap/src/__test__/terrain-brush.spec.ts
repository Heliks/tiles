import { Grid } from '@heliks/tiles-engine';
import { TerrainBrush } from '../terrain-brush';
import { Tilemap } from '../tilemap';
import { LocalTileset, Terrain, TerrainBit } from '../tileset';
import { createEmptyTileset } from '../tileset/__test__/utils';


describe('TerrainBrush', () => {
  let brush: TerrainBrush;
  let terrain: Terrain;
  let tilemap: Tilemap;

  beforeEach(() => {
    terrain = new Terrain('foobar');
    tilemap = new Tilemap(new Grid(3, 3, 16, 16));

    const tileset = createEmptyTileset(new Grid(5, 5, 16, 16));

    brush = new TerrainBrush(tilemap, new LocalTileset(tileset, 1), terrain);
  });

  it.each([
    {
      col: 1,
      row: 1,
      data: [
        1, 1, 0,
        1, 1, 0,
        0, 0, 0
      ],
      terrainId: Terrain.createId(
        TerrainBit.NorthWest,
        TerrainBit.North,
        TerrainBit.West
      )
    },
    {
      col: 1,
      row: 2,
      data: [
        0, 0, 0,
        0, 1, 1,
        1, 1, 1
      ],
      terrainId: Terrain.createId(
        TerrainBit.NorthEast,
        TerrainBit.North,
        TerrainBit.East,
        TerrainBit.West
      )
    }
  ])('should return terrain id $terrainId at location col $col row $row', data => {
    tilemap.setAll(data.data);
    terrain.rule(0, 0);

    const terrainId = brush.getTerrainId(data.col, data.row);

    expect(terrainId).toBe(data.terrainId);
  });

  it('should draw terrain', () => {
    tilemap.setAll([
      0, 0, 0,
      0, 1, 1,
      1, 0, 1
    ]);

    terrain
      .rule(0, 0, Terrain.createId(
          TerrainBit.North,
          TerrainBit.East,
          TerrainBit.South,
          TerrainBit.West
      ))
      .rule(1, Terrain.createId(
        TerrainBit.East,
        TerrainBit.South,
        TerrainBit.SouthEast,
        TerrainBit.SouthWest,
      ))
      .rule(2, Terrain.createId(
        TerrainBit.West,
        TerrainBit.South,
        TerrainBit.SouthWest
      ))
      .rule(
        3,
        Terrain.createId(TerrainBit.East, TerrainBit.NorthEast),
        Terrain.createId(TerrainBit.North)
      )
      .rule(
        4,
        Terrain.createId(TerrainBit.East, TerrainBit.West, TerrainBit.North, TerrainBit.NorthEast),
        Terrain.createId(TerrainBit.NorthWest)
      )
      .rule(5, Terrain.createId(
        TerrainBit.West,
        TerrainBit.North,
        TerrainBit.NorthWest
      ));

    brush.draw(1, 2);

    expect(tilemap.data).toEqual([
      0, 0, 0,
      0, 2, 3,
      4, 5, 6
    ]);
  });

  it.each([
    { col: 0, row: 0, expected: true },
    { col: 1, row: 0, expected: false },
    { col: 2, row: 0, expected: true },
    { col: 0, row: 1, expected: true },
    { col: 1, row: 1, expected: false },
    { col: 2, row: 1, expected: false }
  ])('should only draw tile if cell is not occupied by a terrain tile (x: $col y: $row)', data => {
    tilemap.setAll([
      0, 1, 0,
      0, 1, 1,
      1, 1, 1
    ]);

    // Note: TileID "1" in the tilemap above is a local tile index of "0".
    terrain.rule(0);

    const result = brush.draw(data.col, data.row);

    expect(result).toBe(data.expected);
  })
});

