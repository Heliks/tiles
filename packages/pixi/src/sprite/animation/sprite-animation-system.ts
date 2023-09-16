import { AssetStorage } from '@heliks/tiles-assets';
import { Injectable, ProcessingSystem, Query, QueryBuilder, Ticker, World } from '@heliks/tiles-engine';
import { SpriteRender } from '../renderer';
import { SpriteAnimation } from './sprite-animation';


@Injectable()
export class SpriteAnimationSystem extends ProcessingSystem {

  /**
   * @param assets {@see AssetStorage}
   * @param ticker {@see Ticker}
   */
  constructor(
    private readonly assets: AssetStorage,
    private readonly ticker: Ticker
  ) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(SpriteRender).contains(SpriteAnimation).build();
  }

  /**
   * Applies the transform on the given `animation` component, using `render` to create
   * the new animation. This function assumes that the `transform` property is set on
   * the animation component. Returns `true` if the transform was successful.
   */
  protected transformAnimation(animation: SpriteAnimation, render: SpriteRender): boolean {
    const sheet = this.assets.get(render.spritesheet);

    if (! sheet) {
      return false;
    }

    // Safety: At this point we know that the "transform" value contains something.
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

  /** @inheritDoc */
  public update(world: World): void {
    const animations = world.storage(SpriteAnimation);
    const displays = world.storage(SpriteRender);

    for (const entity of this.query.entities) {
      const animation = animations.get(entity);
      const display = displays.get(entity);

      // Apply animation transform if necessary.
      if (animation.transform && this.transformAnimation(animation, display)) {
        animation.transform = undefined;
      }

      // Cancel if the animation is complete and does not loop.
      if (! animation.loop && animation.isComplete()) {
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

        if (nextFrame === 0) {
          animation.loops++;
        }
      }
    }
  }

}
