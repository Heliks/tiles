import { Injectable } from "@tiles/injector";
import { Query } from "@tiles/entity-system";
import { ProcessingSystem, Ticker, World } from "@tiles/engine";
import { SpriteAnimation } from "./sprite-animation";
import { SpriteDisplay } from "./sprite-display";

/**
 * Applies the transform on the given `animation`, using `display` to create the
 * new animation. This function always assumes that `SpriteAnimation.transform`
 * is set.
 */
export function transformAnimation(animation: SpriteAnimation, display: SpriteDisplay): void {
  const data = display.sheet.getAnimation(animation.transform as string);

  if (data) {
    animation.playing = animation.transform;
    animation.reset();

    // Don't copy a reference here, otherwise editing the animation frames
    // would also edit the original `AnimationData`.
    animation.frames = [
      ...data.frames
    ];

    // Flip animation.
    if (data.flip !== undefined) {
      animation.flipTo(data.flip);
    }

    // Inherit frame duration set by the animation, otherwise we continue
    // to use the one that is currently set.
    if (data.frameDuration) {
      animation.frameDuration = data.frameDuration;
    }
  }

  animation.transform = undefined;
}

@Injectable()
export class SpriteAnimationSystem extends ProcessingSystem {

  /**
   * @param ticker [[Ticker]]
   */
  constructor(protected readonly ticker: Ticker) {
    super();
  }

  /** {@inheritDoc} */
  public getQuery(): Query {
    return {
      contains: [
        SpriteAnimation,
        SpriteDisplay
      ]
    };
  }

  /** {@inheritDoc} */
  public update(world: World): void {
    const _anim = world.storage(SpriteAnimation);
    const _disp = world.storage(SpriteDisplay);

    for (const entity of this.group.entities) {
      const animation = _anim.get(entity);
      const display = _disp.get(entity);

      // Apply animation transform if necessary.
      if (animation.transform) {
        transformAnimation(animation, display);
      }

      animation.elapsedTime += this.ticker.delta;

      // Calculate the next frame index based on the effective frame duration.
      const nextFrame = (
        animation.elapsedTime / animation.frameDuration * animation.speed
      ) % animation.frames.length | 0;

      // Don't update the animation if looping is disabled and the next frame would
      // start a new animation cycle.
      if (!animation.loop && animation.frame > 0 && nextFrame === 0) {
        continue;
      }

      // Update the sprite display with the next frame if necessary.
      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        // Update display with next frame.
        display.setIndex(animation.frames[ nextFrame ]).flipTo(animation.flip);
      }
    }
  }

}
