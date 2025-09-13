import { AssetLoader, AssetsBundle } from '@heliks/tiles-assets';
import { runtime, World } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { LoadSpriteSheet, SpriteSheetData } from '../load-sprite-sheet';
import { SpriteGrid } from '../sprite-grid';
import { SpriteSheet } from '../sprite-sheet';


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

  function load(data: SpriteSheetData): Promise<SpriteGrid> {
    return format.process(data, 'foo.spritesheet', loader);
  }

  it('should create a spritesheet', async () => {
    const spritesheet = await load({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100
    });

    expect(spritesheet).toBeInstanceOf(SpriteSheet);
  });

  it('should parse sprite size', async () => {
    const spritesheet = await load({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      spriteWidth: 25,
      spriteHeight: 50
    });

    expect(spritesheet.grid).toMatchObject({
      cellWidth: 25,
      cellHeight: 50
    });
  })

  it('should use image size if sprite size is undefined', async () => {
    const spritesheet = await load({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 150
    });

    expect(spritesheet.grid).toMatchObject({
      cellWidth: 100,
      cellHeight: 150
    });
  });

  it('should parse slices', async () => {
    const spritesheet = await load({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      slices: {
        'foo': {
          w: 20,
          h: 10,
          x: 5,
          y: 0
        }
      }
    });

    const slice = spritesheet.getSliceRegion('foo');

    expect(slice).toMatchObject({
      width: 20,
      height: 10,
      x: 5,
      y: 0
    });
  });
});
