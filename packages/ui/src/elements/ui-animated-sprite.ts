import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { Ticker, Timer, World } from '@heliks/tiles-engine';
import { SpriteAnimationFrames, SpriteSheet } from '@heliks/tiles-pixi';
import { Sprite } from 'pixi.js';
import { Element } from '../element';
import { Rect, Size } from '../layout';


/** Displays an animated sprite. */
export class UiAnimatedSprite implements Element {

  /** @inheritDoc */
  public readonly view = new Sprite();

  /** @inheritDoc */
  public readonly size = new Rect(
    Size.px(0),
    Size.px(0)
  );


  /**
   * Currently playing animation.
   *
   * @internal
   */
  private frames?: SpriteAnimationFrames;

  /**
   * Index of the {@link frames animation} frame that is currently active.
   *
   * @internal
   */
  private frame = 0;

  /**
   * Name of the animation that is currently playing.
   *
   * @internal
   */
  private playing?: string;

  /**
   * Timer used to track frame cycles.
   *
   * @internal
   */
  private timer = new Timer(100, true);

  /**
   * @param spritesheet Spritesheet used to create the animation.
   * @param animation Name of the animation that should be played.
   */
  constructor(public spritesheet: Handle<SpriteSheet>, public animation: string) {}

  /** @internal */
  private setFrameIndex(spritesheet: SpriteSheet, frame: number): void {
    // Safety: Frames are always set before this function is called.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.view.texture = spritesheet.texture( this.frames!.frames[ frame ] )
    this.frame = frame;
  }

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const asset = world.get(AssetStorage).get(this.spritesheet);

    if (! asset) {
      return;
    }

    if (this.animation !== this.playing) {
      this.playing = this.animation;
      this.frames = asset.getAnimation(this.animation);

      this.timer.duration = this.frames.frameDuration ?? 100;
      this.timer.reset();

      // Apply first frame of animation to sprite.
      this.setFrameIndex(asset, 0);
    }

    // No animation playing right now.
    if (! this.frames) {
      return;
    }

    this.timer.update(world.get(Ticker).delta);

    if (this.timer.hasFinishedThisTick()) {
      const frameIdx = this.frame + 1;

      if (frameIdx === this.frames.frames.length) {
        this.setFrameIndex(asset, 0);
      }
      else {
        this.setFrameIndex(asset, frameIdx);
      }
    }

    this.size.width.value = this.view.texture.width;
    this.size.height.value = this.view.texture.height;
  }

}
