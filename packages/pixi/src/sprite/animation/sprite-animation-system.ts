import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { Injectable, ProcessingSystem, Query, QueryBuilder, Ticker, World } from '@heliks/tiles-engine';
import { SpriteRender } from '../renderer';
import { SpriteSheet } from '../sprite-sheet';
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
   * Applies animation data of the given `spritesheet` to a sprite `animation`.
   *
   * @param animation Sprite animation to which animation data should be applied.
   * @param spritesheet Asset handle for the sprite-sheet from which the animation data
   *  will be resolved. Applying the animation will fail if this is not fully loaded.
   * @param name Name of the animation data, defined on the given `sprite-sheet`.
   *
   * @returns A boolean indicating if the animation was successfully changed. This can
   *  fail if the provided sprite-sheet is not fully loaded.
   */
  public apply(animation: SpriteAnimation, spritesheet: Handle<SpriteSheet>, name: string): boolean {
    const sheet = this.assets.get(spritesheet);

    if (! sheet) {
      return false;
    }

    const data = sheet.getAnimation(name);

    animation.reset();
    animation.playing = name;

    // Don't copy a reference here, otherwise editing the animation frames would also
    // edit the original `AnimationData`.
    animation.frames = [
      ...data.frames
    ];

    if (data.frameDuration) {
      animation.frameDuration = data.frameDuration;
    }

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
      if (animation.transform && this.apply(animation, display.spritesheet, animation.transform)) {
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
