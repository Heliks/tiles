import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Sprite } from 'pixi.js';
import { Rect, Size } from '../layout';
import { UiWidget } from '../ui-widget';


/**
 * Ui widget that displays a sprite.
 */
export class UiSprite implements UiWidget {

  /** @inheritDoc */
  public readonly view = new Sprite();

  /** @inheritDoc */
  public readonly size = new Rect(
    Size.px(0),
    Size.px(0)
  );

  /** @internal */
  private currentIndex = -1;

  /**
   * @param spritesheet Spritesheet from which the sprite textures will be created.
   * @param spriteIndex Index of the sprite that should be displayed.
   */
  constructor(public spritesheet: Handle<SpriteSheet>, public spriteIndex: number) {}

  /** Updates the displayed sprite. */
  public set(spritesheet: Handle<SpriteSheet>, spriteIndex: number): this {
    this.spritesheet = spritesheet;
    this.spriteIndex = spriteIndex;

    return this;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const asset = world.get(AssetStorage).get(this.spritesheet);

    if (asset && this.currentIndex !== this.spriteIndex) {
      this.view.texture = asset.data.texture(this.spriteIndex);
      this.currentIndex = this.spriteIndex;

      this.size.width.value = this.view.texture.width;
      this.size.height.value = this.view.texture.height;
    }
  }

}
