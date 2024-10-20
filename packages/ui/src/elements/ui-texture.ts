import { Rect, Size } from '@heliks/flex';
import { AssetStorage, Handle } from '@heliks/tiles-assets';
import { World } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { Element } from '../element';


/** Displays a texture. */
export class UiTexture implements Element {

  /** @inheritDoc */
  public readonly size = new Rect(
    Size.px(0),
    Size.px(0)
  );

  /** @inheritDoc */
  public readonly view = new Sprite();

  /** @internal */
  private dirty = true;

  /**
   * @param texture The texture that should be displayed.
   */
  constructor(private texture: Texture | Handle<Texture>) {}

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  /** @internal */
  private resolveTextureUpdate(world: World): Texture | undefined {
    return this.texture instanceof Handle ? world.get(AssetStorage).get(this.texture) : this.texture;
  }

  /**
   * Updates the current texture of the element. If a handle that points to a texture
   * is given, the element will be updated as soon as the handle has finished loading.
   */
  public setTexture(texture: Texture | Handle<Texture>): this {
    this.texture = texture;
    this.dirty = true;

    return this;
  }

  /** @inheritDoc */
  public update(world: World): void {
    if (this.dirty) {
      const texture = this.resolveTextureUpdate(world);

      if (texture) {
        this.dirty = false;
        this.view.texture = texture;
      }
    }

    if (this.view.texture) {
      this.size.width.value = this.view.texture.width;
      this.size.height.value = this.view.texture.height;
    }
  }

}
