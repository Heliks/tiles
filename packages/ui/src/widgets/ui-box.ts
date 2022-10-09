import { Graphics, Sprite } from '@heliks/tiles-pixi';
import { Texture } from 'pixi.js';
import { BorderStyle } from '../border-style';
import { UiWidget } from '../ui-widget';


/** Available styles for {@link UiBox} */
export interface BoxStyle {

  /** If set, a border in that style is drawn around the box. */
  border?: BorderStyle;

  /** Opacity of the box. This does not affect child elements */
  opacity: number;

}

/** Hex color code or texture that is used as background for a {@link UiBox}. */
export type BoxBackground = Texture | number;

/** Widget that displays a simple box. */
export class UiBox implements UiWidget {

  /** Style properties. */
  public readonly style: BoxStyle = {
    opacity: 1,
  }

  /** @inheritDoc */
  public view = new Graphics();

  /**
   * If a texture is used as background this will contain the sprite created from that
   * texture, scaled to fit the box size.
   */
  private sprite?: Sprite;

  /**
   * @param width Width of the box in px.
   * @param height Height of the box in px.
   * @param background {@link BoxBackground}
   */
  constructor(public width: number, public height: number, public background: BoxBackground) {}

  /** Draws the box background. */
  private drawBg(): void {
    if (typeof this.background === 'number') {
      this.view.beginFill(this.background, this.style.opacity);
    }
    else {
      if (this.sprite) {
        this.sprite.width = this.width;
        this.sprite.height = this.height;
      }
      else {
        const sprite = new Sprite(this.background);

        sprite.width = this.width;
        sprite.height = this.height;

        this.view.addChild(sprite);
        this.sprite = sprite;
      }
    }
  }

  /** @inheritDoc */
  public update(): void {
    this.view.clear();

    // Sets the pivot to be the center of the box.
    this.view.pivot.set(this.width >> 1, this.height >> 1);

    this.drawBg();

    if (this.style.border) {
      this.view.lineStyle(this.style.border.width, this.style.border.color);
    }

    this.view.drawRect(0, 0, this.width, this.height);
  }

}
