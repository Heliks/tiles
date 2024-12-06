import { AssetLoader, AssetsBundle, Handle } from '@heliks/tiles-assets';
import { Grid, runtime, World } from '@heliks/tiles-engine';
import { Texture } from 'pixi.js';
import { SpriteGrid, SpriteSheet } from '../../sprite-sheet';
import { SpriteAnimation } from '../sprite-animation';
import { SpriteAnimationSystem } from '../sprite-animation-system';


describe('SpriteAnimationSystem', () => {
  let system: SpriteAnimationSystem;
  let world: World;

  let spritesheet: SpriteSheet;
  let spritesheetHandle: Handle<SpriteSheet>;

  beforeEach(() => {
    world = runtime()
      .bundle(new AssetsBundle())
      .system(SpriteAnimationSystem)
      .build()
      .world;

    system = world.get(SpriteAnimationSystem);

    spritesheet = new SpriteGrid(new Grid(5, 5, 16, 16), Texture.WHITE);
    spritesheetHandle = world.get(AssetLoader).insert('',  spritesheet).handle();
  });

  describe('apply()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation();
    });

    it('should apply animation frames', () => {
      const frames = [4, 3, 2, 1, 0];

      spritesheet.setAnimation('foo', {
        frames: [
          4, 3, 2, 1, 0
        ]
      })

      system.apply(animation, spritesheetHandle, 'foo');

      expect(animation.frames).toEqual(frames);
    });

    it('should apply animation duration', () => {
      spritesheet.setAnimation('foo', {
        frameDuration: 150,
        frames: [0]
      })

      system.apply(animation, spritesheetHandle, 'foo');

      expect(animation.frameDuration).toBe(150);
    });
  });
});
