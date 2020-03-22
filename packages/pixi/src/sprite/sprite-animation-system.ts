import { Injectable } from "@tiles/injector";
import { Query } from "@tiles/entity-system";
import { ProcessingSystem, Ticker, World } from "@tiles/engine";
import { SpriteAnimation } from "./sprite-animation";
import { SpriteDisplay } from "./sprite-display";

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
    const $animation = world.storage(SpriteAnimation);
    const $display = world.storage(SpriteDisplay);

    for (const entity of this.group.entities) {
      const animation = $animation.get(entity);
      const display = $display.get(entity);

      // Transform animation.
      if (animation.transform) {
        const data = display.sheet.getAnimation(animation.transform);

        if (data) {
          // Assign animation data to component.
          Object.assign(animation, data);

          animation.playing = animation.transform;
          animation.reset();
        }

        animation.transform = undefined;
      }

      animation.elapsedTime += this.ticker.delta;

      // The effective duration in ms of a frame, based on the frame
      // duration and the animation speed.
      const frameMs = animation.frameDuration * animation.speed;

      // Calculate next frame based on elapsed time and frame ms.
      const nextFrame = ((animation.elapsedTime / frameMs) % animation.frames.length) | 0;

      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        // Update display with next frame.
        display.setSprite(animation.frames[ nextFrame ]);
      }
    }
  }

}