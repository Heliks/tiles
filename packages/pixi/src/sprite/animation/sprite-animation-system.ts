import { contains, Injectable, ProcessingSystem, Ticker, World } from '@heliks/tiles-engine';
import { SpriteRender } from '../renderer';
import { SpriteSheetStorage } from '../sprite-sheet';
import { SpriteAnimation } from './sprite-animation';

@Injectable()
export class SpriteAnimationSystem extends ProcessingSystem {

  /**
   * @param storage The storage containing sprite sheets.
   * @param ticker [[Ticker]]
   */
  constructor(
    private readonly ticker: Ticker,
    private readonly storage: SpriteSheetStorage
  ) {
    super(contains(SpriteAnimation, SpriteRender));
  }

  /**
   * Applies the transform on the given `animation` component, using `render` to create
   * the new animation. This function assumes that a the `transform` property is set on
   * the animation component. Returns `true` if the transform was successful.
   */
  protected transformAnimation(animation: SpriteAnimation, render: SpriteRender): boolean {
    const sheet = typeof render.spritesheet === 'symbol'
      ? this.storage.get(render.spritesheet)?.data
      : render.spritesheet;

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
    const displays = world.storage(SpriteRender);

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

      // Update the sprite renderer with the next frame if necessary.
      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        display.flipX = animation.flipX;
        display.flipY = animation.flipY;

        display.setIndex(animation.frames[nextFrame]);
      }
    }
  }

}
