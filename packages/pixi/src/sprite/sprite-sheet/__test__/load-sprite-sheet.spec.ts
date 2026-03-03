import { AssetLoader, AssetsBundle } from '@heliks/tiles-assets';
import { runtime, World } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { LoadSpriteSheet, SpriteSheetData } from '../load-sprite-sheet';
import { SpriteGrid } from '../sprite-grid';
import { SpritePack } from '../sprite-pack';
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

  function load<T extends SpriteSheet>(data: SpriteSheetData): Promise<T> {
    return format.process(data, 'foo.spritesheet', loader) as Promise<T>;
  }

  it('should create a sprite grid', async () => {
    const spritesheet = await load<SpritePack>({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 100,
      spriteWidth: 5,
      spriteHeight: 5
    });

    expect(spritesheet).toBeInstanceOf(SpriteGrid);
  });

  it('should create a packed spritesheet', async () => {
    const spritesheet = await load<SpritePack>({
      image: 'foo.png',
      imageWidth: 100,
      imageHeight: 150
    });

    expect(spritesheet).toBeInstanceOf(SpritePack);
  });

  it('should parse sprite size', async () => {
    const spritesheet = await load<SpriteGrid>({
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
