import { Terrain, TerrainBit } from '../terrain';
import { TerrainRule } from '../terrain-rule';


describe('Terrain', () => {
  let terrain: Terrain;

  beforeEach(() => {
    terrain = new Terrain('foobar');
  });

  it.each([
    {
      expected: true,
      terrainId: Terrain.createId(TerrainBit.North)
    },
    {
      expected: true,
      terrainId: Terrain.createId(TerrainBit.North, TerrainBit.NorthEast)
    },
    {
      expected: false,
      terrainId: Terrain.createId(TerrainBit.South)
    }
  ])('should match terrain id $terrainId', data => {
    const rule = new TerrainRule([1], Terrain.createId(TerrainBit.North));
    const result = rule.test(data.terrainId);

    expect(result).toBe(data.expected);
  });
});
