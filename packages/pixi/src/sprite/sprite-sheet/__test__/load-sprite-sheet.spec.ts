import { AssetLoader, AssetsBundle } from '@heliks/tiles-assets';
import { runtime, World } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { LoadSpriteSheet } from '../load-sprite-sheet';
import { SpriteGrid } from '../sprite-grid';
import { SpriteSlices } from '../sprite-slices';


describe('LoadSpriteSheet', () => {
  let format: LoadSpriteSheet;
  let loader: AssetLoader;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .bundle(new AssetsBundle())
      .build()
      .world;

    format = new LoadSpriteSheet();
    loader = world.get(AssetLoader);

    // The format will attempt to load a texture. Mock that call.
    loader.fetch = jest.fn().mockReturnValue(Texture.WHITE);
  });

  it('should parse "slices" spritesheet', async () => {
    const data = {
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      type: 'slices' as const,
      slices: {}
    };

    const spritesheet = await format.process(data, 'foo.spritesheet', loader);

    expect(spritesheet).toBeInstanceOf(SpriteSlices);
  });

  it('should parse slices', async () => {
    const data = {
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      type: 'slices' as const,
      slices: {
        'foo': {
          w: 20,
          h: 10,
          x: 5,
          y: 0
        }
      }
    };

    const spritesheet = await format.process(data, 'foo.spritesheet', loader);
    const sliceRegion = spritesheet.getSliceRegion('foo');

    expect(sliceRegion).toMatchObject({
      width: 20,
      height: 10,
      x: 5,
      y: 0
    });
  });

  it('should parse "grid" spritesheet', async () => {
    const data = {
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      spriteWidth: 16,
      spriteHeight: 16,
      type: 'grid' as const
    };

    const spritesheet = await format.process(data, 'foo.spritesheet', loader);

    expect(spritesheet).toBeInstanceOf(SpriteGrid);
  });
});