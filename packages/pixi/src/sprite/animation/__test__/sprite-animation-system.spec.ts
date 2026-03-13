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
  let handle: Handle<SpriteSheet>;

  beforeEach(() => {
    world = runtime()
      .bundle(new AssetsBundle())
      .system(SpriteAnimationSystem)
      .build()
      .world;

    system = world.get(SpriteAnimationSystem);

    spritesheet = new SpriteGrid(new Grid(5, 5, 16, 16), Texture.WHITE);
    spritesheet.getAnimation = jest.fn();

    handle = world
      .get(AssetLoader)
      .insert('',  spritesheet)
      .handle();
  });

  describe('transform()', () => {
    let animation: SpriteAnimation;

    beforeEach(() => {
      animation = new SpriteAnimation();
      animation.setAnimation = jest.fn();
    });

    it('should transform animation', () => {
      animation.play('foo');

      system.transform(animation, handle);

      expect(animation.setAnimation).toHaveBeenCalled()
      expect(animation.playing).toBe('foo');
    });

    it('should transform animation with preserve', () => {
      // Dummy for animation data.
      const data = Symbol();

      spritesheet.getAnimation = jest.fn().mockReturnValue(data);

      animation.play('foo', true, true);

      system.transform(animation, handle);

      expect(animation.setAnimation).toHaveBeenCalledWith(data, true);
    });

    it('should do nothing if spritesheet cannot be resolved', () => {
      system.transform(animation, new Handle('invalid', 'invalid'));

      expect(animation.setAnimation).not.toHaveBeenCalled();
    });

    it('should deactivate the animation transform', () => {
      system.transform(animation, handle);

      expect(animation.transform.active).toBe(false);
    });
  });
});
