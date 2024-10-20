import { AssetLoader, AssetsBundle, Handle } from '@heliks/tiles-assets';
import { Grid, runtime, World } from '@heliks/tiles-engine';
import { SpriteGrid } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { UiSprite } from '../ui-sprite';


describe('UiSprite', () => {
  let world: World;
  let spritesheet: Handle<SpriteGrid>;

  beforeEach(() => {
    world = runtime().bundle(new AssetsBundle()).build().world;

    spritesheet = world
      .get(AssetLoader)
      .data('foo.spritesheet', new SpriteGrid(new Grid(5, 5, 10, 10), Texture.WHITE));
  })

  it('should calculate element size', () => {
    const sprite = new UiSprite(spritesheet, 0);

    sprite.update(world);

    expect(sprite.size.width.value).toBe(10);
    expect(sprite.size.height.value).toBe(10);
  });

  it('should calculate scaled element size', () => {
    const sprite = new UiSprite(spritesheet, 0);

    sprite.scale = 2;
    sprite.update(world);

    expect(sprite.size.width.value).toBe(20);
    expect(sprite.size.height.value).toBe(20);
  });
});
