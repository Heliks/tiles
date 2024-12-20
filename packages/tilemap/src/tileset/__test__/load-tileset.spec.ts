import { AssetLoader, AssetStorage, Fetch } from '@heliks/tiles-assets';
import { Texture } from 'pixi.js';
import { CustomPropertyType } from '../../properties';
import { LoadTileset, TilesetData } from '../load-tileset';
import { Terrain, TerrainBit } from '../terrain';
import { Tileset } from '../tileset';


/** @internal */
function createTilesetData(append?: Partial<TilesetData>): TilesetData {
  let data = {
    image: 'foo.png',
    tileWidth: 16,
    tileHeight: 16,
    imageWidth: 160,
    imageHeight: 160
  };

  if (append) {
    data = {
      ...data,
      ...append
    };
  }

  return data;
}

describe('LoadTileset', () => {
  let format: LoadTileset;
  let loader: AssetLoader;

  beforeEach(() => {
    format = new LoadTileset();
    loader = new AssetLoader(new AssetStorage(), new Fetch());

    // The only time we fetch something it is to load the tileset texture. Overwrite
    // this so an empty texture is returned every time.
    loader.fetch = jest.fn().mockReturnValue(Promise.resolve(
      Texture.WHITE
    ));
  });

  function process(data: TilesetData): Promise<Tileset> {
    return format.process(data, 'foo.json', loader)
  }

  it('should correctly parse size', async () => {
    const tileset = await process(createTilesetData());

    expect(tileset.size).toBe(100);
  });

  describe('when deserializing terrain', () => {
    it('should deserialize terrains', async () => {
      const data = createTilesetData();

      data.terrains = [
        {
          name: 'Foo',
          tiles: [{ index: 0 }]
        }
      ];

      const tileset = await process(data);
      const terrain = tileset.getTerrain('Foo');

      expect(terrain).toBeInstanceOf(Terrain);
    });

    it('should deserialize tile rules', async () => {
      const data = createTilesetData();

      data.terrains = [
        {
          name: 'Foo',
          tiles: [
            {
              index: 5,
              rules: {
                n: true,
                s: true,
                e: false,
                w: false
              }
            }
          ]
        }
      ];

      const tileset = await process(data);

      // Retrieve the rule that should've been created during serialization. Since there
      // is only one rule it is always the first index.
      const rule = tileset.getTerrain('Foo')?.getTileRules(5)[0];

      expect(rule).toMatchObject({
        contains: Terrain.createId(TerrainBit.North, TerrainBit.South),
        excludes: Terrain.createId(TerrainBit.East, TerrainBit.West),
      });
    });
  });

  describe('when deserializing custom tiles', () => {
    it('should deserialize tile properties', async () => {
      const data = createTilesetData({
        tiles: [
          {
            index: 0,
            props: [
              { name: 'foo', type: CustomPropertyType.Boolean, value: true },
              { name: 'bar', type: CustomPropertyType.Boolean, value: false }
            ]
          }
        ]
      });

      const tileset = await process(data);
      const tile = tileset.tiles.get(0);

      expect(tile?.props).toMatchObject({
        foo: true,
        bar: false
      })
    });
  });
});
