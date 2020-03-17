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

      animation.elapsedTime += this.ticker.delta;

      const nextFrame = Math.round((animation.elapsedTime / animation.speed) % animation.frames.length);

      if (nextFrame != animation.frame) {
        animation.frame = nextFrame;

        $display.get(entity).setSpriteId(nextFrame);
      }
    }
  }

}