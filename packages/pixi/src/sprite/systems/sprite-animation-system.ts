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
   * component. Returns `true` if the animation was successfuly transformed.
   */
  protected transformAnimation(animation: SpriteAnimation, display: SpriteDisplay): boolean {
    const sheet = typeof display.spritesheet === 'symbol'
      ? this.storage.get(display.spritesheet)?.data
      : display.spritesheet;

    if (!sheet) {
      return false;
    }

    // At this point we already know that the "transform" value contains something so
    // we can safely cast this.
    const name = animation.transform as string;
    const data = sheet.getAnimation(name);

    animation.reset();
    animation.playing = name;

    // Don't copy a reference here, otherwise editing the animation frames would also
    // edit the original `AnimationData`.
    animation.frames = [
      ...data.frames
    ];

    return true;
  }

  public r = 0;

  /** @inheritDoc */
  public update(world: World): void {
    const animations = world.storage(SpriteAnimation);
    const displays = world.storage(SpriteDisplay);

    this.r++;

    for (const entity of this.group.entities) {
      const animation = animations.get(entity);
      const display = displays.get(entity);

      // Apply animation transform if necessary.
      if (animation.transform && this.transformAnimation(animation, display)) {
        animation.transform = undefined;
      }

      // Cancel if the animation is complete and does not loop.
      if (!animation.loop && animation.isComplete()) {
        continue;
      }

      animation.elapsedTime += this.ticker.delta;

      if (animation.frames.length === 0) {
        continue;
      }

      // Calculate the next frame index based on the effective frame duration.
      // eslint-disable-next-line unicorn/prefer-math-trunc
      const nextFrame = (animation.elapsedTime / (animation.frameDuration / animation.speed))
        % animation.frames.length | 0;

      // Check if looping is disabled and if the next frame would start a new animation
      // cycle.
      // if (!animation.loop && animation.frame > 0 && nextFrame === 0) {
      //   console.log(this.r, 'BRAK', animation.frame, nextFrame);

      // continue;
      // }

      // console.log(this.r, 'HALLO', animation.frame, nextFrame)

      // Update the sprite display with the next frame if necessary.
      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        display.flipX = animation.flipX;
        display.flipY = animation.flipY;

        display.setIndex(animation.frames[nextFrame]);
      }
    }
  }

}
