import { UiWidget } from '../ui-widget';
import { Sprite, Texture } from 'pixi.js';


export class UiTexture implements UiWidget {

  /** @inheritDoc */
  public readonly view = new Sprite();

  /**
   * @param texture The texture that should be displayed.
   */
  constructor(public texture: Texture) {}

  /** @inheritDoc */
  public update(): void {
    this.view.texture = this.texture;
  }

}
