import { UiWidget } from '../ui-widget';
import { Sprite } from 'pixi.js';
import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { World } from '@heliks/tiles-engine';


/**
 * Ui widget that displays a sprite.
 */
export class UiSprite implements UiWidget {

  /** @inheritDoc */
  public readonly view = new Sprite();

  /** @internal */
  private currentIndex = -1;

  /**
   * @param spritesheet Spritesheet from which the sprite textures will be created.
   * @param spriteIndex Index of the sprite that should be displayed.
   */
  constructor(
    public spritesheet: Handle<SpriteSheet>,
    public spriteIndex: number
  ) {}

  /** @inheritDoc */
  public update(world: World): void {
    const asset = world.get(AssetStorage).get(this.spritesheet);

    if (asset && this.currentIndex !== this.spriteIndex) {
      this.view.texture = asset.data.texture(this.spriteIndex);
      this.currentIndex = this.spriteIndex;
    }
  }

}
