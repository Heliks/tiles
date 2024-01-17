import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { World } from '@heliks/tiles-engine';
import { SpriteSheet } from '@heliks/tiles-pixi';
import { Sprite } from 'pixi.js';
import { Element, ViewRef } from '../element';
import { Rect, Size } from '../layout';


/** Displays a sprite. */
export class UiSprite<I = unknown> implements Element {

  /** @inheritDoc */
  public readonly view = new Sprite();

  /** @inheritDoc */
  public readonly size = new Rect(
    Size.px(0),
    Size.px(0)
  );

  /** @internal */
  private currentId?: I;

  /**
   * @param spritesheet Spritesheet from which the sprite textures will be created.
   * @param spriteIndex Id of the sprite that should be displayed.
   */
  constructor(public spritesheet: Handle<SpriteSheet<I>>, public spriteIndex: I) {
    this.view.visible = false;
  }

  /** @inheritDoc */
  public getViewRef(): ViewRef {
    return this;
  }

  /** Updates the displayed sprite. */
  public set(spritesheet: Handle<SpriteSheet>, spriteIndex: I): this {
    this.spritesheet = spritesheet;
    this.spriteIndex = spriteIndex;

    return this;
  }

  /** @inheritDoc */
  public update(world: World): void {
    const asset = world.get(AssetStorage).get(this.spritesheet);

    if (asset && this.currentId !== this.spriteIndex) {
      this.view.visible = true;
      this.view.texture = asset.texture(this.spriteIndex);

      this.currentId = this.spriteIndex;

      this.size.width.value = this.view.texture.width;
      this.size.height.value = this.view.texture.height;
    }
  }

}
