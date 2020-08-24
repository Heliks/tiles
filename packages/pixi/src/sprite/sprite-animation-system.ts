import { EntityQuery, Inject, Injectable, ProcessingSystem, Ticker, World } from '@heliks/tiles-engine';
import { SpriteAnimation } from './sprite-animation';
import { SpriteDisplay } from './sprite-display';
import { FlipMode, SPRITE_SHEET_STORAGE, SpriteAnimationData, SpriteSheet } from '../sprite-sheet/sprite-sheet';
import { AssetStorage } from '@heliks/tiles-assets';

/** @internal */
function translateFlipMode(data: SpriteAnimationData): FlipMode {
  switch (data.flip) {
    case 'both':
      return FlipMode.Both;
    case 'horizontal':
      return FlipMode.Horizontal;
    case 'vertical':
      return FlipMode.Vertical;
    default:
      return FlipMode.None;
  }
}

@Injectable()
export class SpriteAnimationSystem extends ProcessingSystem {

  /**
   * @param storage The storage containing sprite sheets.
   * @param ticker [[Ticker]]
   */
  constructor(
    @Inject(SPRITE_SHEET_STORAGE)
    protected readonly storage: AssetStorage<SpriteSheet>,
    protected readonly ticker: Ticker
  ) {
    super();
  }

  /** @inheritDoc */
  public getQuery(): EntityQuery {
    return {
      contains: [
        SpriteAnimation,
        SpriteDisplay
      ]
    };
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

    // The SpriteSheet asset is not loaded yet.
    if (!sheet) {
      return;
    }

    const data = sheet.getAnimation(animation.transform as string);

    if (data) {
      animation.playing = animation.transform;
      animation.reset();

      // Don't copy a reference here, otherwise editing the animation frames would also
      // edit the original animation data.
      animation.frames = [ ...data.frames ];
      animation.flipMode = translateFlipMode(data);

      // Inherit frame duration set by the animation, otherwise we continue to use the
      // one that is currently set.
      if (data.frameDuration) {
        animation.frameDuration = data.frameDuration;
      }
    }

    animation.transform = undefined;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const _anim = world.storage(SpriteAnimation);
    const _disp = world.storage(SpriteDisplay);

    for (const entity of this.group.entities) {
      const animation = _anim.get(entity);
      const display = _disp.get(entity);

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
