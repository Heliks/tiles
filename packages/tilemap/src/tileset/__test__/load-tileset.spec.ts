import { LoadTileset, TilesetData } from '../load-tileset';
import { Texture } from 'pixi.js';
import { AssetLoader } from '@heliks/tiles-assets';


/** @internal */
function createTilesetData(): TilesetData {
  return {
    image: 'foo.png',
    tileWidth: 16,
    tileHeight: 16,
    imageWidth: 160,
    imageHeight: 160
  };
}

describe('LoadTileset', () => {
  let format: LoadTileset;
  let loader: AssetLoader;

  beforeEach(() => {
    format = new LoadTileset();
    loader = new AssetLoader();

    // The only time we fetch something it is to load the tileset texture. Overwrite
    // this so an empty texture is returned every time.
    loader.fetch = jest.fn().mockReturnValue(Promise.resolve(
      Texture.WHITE
    ));
  });

  it('should correctly parse spritesheet size', async () => {
    const tileset = await format.process(createTilesetData(), 'foo.json', loader);

    expect(tileset.spritesheet.size()).toBe(100);
  });
});
