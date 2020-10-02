import { contains, Inject, Injectable, ProcessingSystem, Ticker, World } from '@heliks/tiles-engine';
import { SpriteAnimation, SpriteDisplay } from '../components';
import { AssetStorage } from '@heliks/tiles-assets';
import { SPRITE_SHEET_STORAGE, SpriteSheet } from '../sprite-sheet';

@Injectable()
export class SpriteAnimationSystem extends ProcessingSystem {

  /**
   * @param storage The storage containing sprite sheets.
   * @param ticker [[Ticker]]
   */
  constructor(
    @Inject(SPRITE_SHEET_STORAGE)
    private readonly storage: AssetStorage<SpriteSheet>,
    private readonly ticker: Ticker
  ) {
    super(contains(SpriteAnimation, SpriteDisplay));
  }

  /**
   * Applies the transform on the given `animation`, using `display` to create the new
   * animation. This function always assumes that `transform` is set on the `animation`
   * component.
   */
  protected transformAnimation(animation: SpriteAnimation, display: SpriteDisplay): void {
    const sheet = typeof display.spritesheet === 'symbol'
      ? this.storage.get(display.spritesheet)?.data
      : display.spritesheet;


    // Only create the animation if the sprite-sheet is loaded yet.
    if (sheet) {
      sheet.createAnimation(
        animation.transform as string,
        animation
      );

      animation.transform = undefined;
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    const animations = world.storage(SpriteAnimation);
    const displays = world.storage(SpriteDisplay);

    for (const entity of this.group.entities) {
      const animation = animations.get(entity);
      const display = displays.get(entity);

      // Apply animation transform if necessary.
      if (animation.transform) {
        this.transformAnimation(animation, display);
      }

      animation.elapsedTime += this.ticker.delta;

      // Calculate the next frame index based on the effective frame duration.
      const nextFrame = (
        animation.elapsedTime / animation.frameDuration * animation.speed
      ) % animation.frames.length | 0;

      // Check if looping is disabled and if the next frame would start a new animation
      // cycle.
      if (!animation.loop && animation.frame > 0 && nextFrame === 0) {
        continue;
      }

      // Update the sprite display with the next frame if necessary.
      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        display.flipMode = animation.flipMode;
        display.setIndex(animation.frames[nextFrame]);
      }
    }
  }

}
