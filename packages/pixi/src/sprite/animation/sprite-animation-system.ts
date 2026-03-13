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
  constructor(private readonly assets: AssetStorage, private readonly ticker: Ticker) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(SpriteRender).contains(SpriteAnimation).build();
  }

  /**
   * Transforms the given `animation` according to its own transform data, regardless
   * if it is active or not.
   *
   * @param animation Animation component to transform.
   * @param handle Asset handle for the spritesheet from where animation data will be resolved.
   */
  public transform(animation: SpriteAnimation, handle: Handle<SpriteSheet>): void {
    const spritesheet = this.assets.get(handle);

    if (! spritesheet) {
      return;
    }

    animation.setAnimation(
      spritesheet.getAnimation(animation.transform.animation),
      animation.transform.preserve
    );

    animation.playing = animation.transform.animation;
    animation.transform.active = false;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const animations = world.storage(SpriteAnimation);
    const displays = world.storage(SpriteRender);

    for (const entity of this.query.entities) {
      const animation = animations.get(entity);
      const display = displays.get(entity);

      if (animation.transform.active) {
        this.transform(animation, display.spritesheet);
      }

      display.flipX = animation.flipX;
      display.flipY = animation.flipY;

      if (animation.step(this.ticker.delta)) {
        display.spriteId = animation.frames[animation.frame];
      }
    }
  }

}
