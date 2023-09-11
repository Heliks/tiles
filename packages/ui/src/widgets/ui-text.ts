import { World } from '@heliks/tiles-engine';
import { Text } from 'pixi.js';
import { Rect, Size } from '../layout';
import { UiWidget } from '../ui-widget';


export enum TextBorderStyle {
  Miter,
  Round,
  Bevel
}

export class UiText implements UiWidget {

  /**
   * Name of the default font that should be used for new {@link UiText} widgets. The
   * font can be set individually on each widget.
   */
  public static defaultFont = 'serif';

  /** @inheritDoc */
  public view = new Text('', {
    align: 'center'
  });

  /** @inheritDoc */
  public readonly size = new Rect(
    Size.px(0),
    Size.px(0)
  );

  /**
   * @param value The text that should be rendered.
   * @param color Color in which the text should be rendered.
   * @param size Font size in px.
   */
  constructor(public value: string, color = 0x000000, size = 10) {
    this.view.text = value;
    this.view.style.fontSize = size;
    this.view.style.fill = color;
    this.view.resolution = 2;
  }

  /** @inheritDoc */
  public update(world: World): void {
    this.view.text = this.value;
    this.size.width.value = this.view.width;
    this.size.height.value = this.view.height;
  }

  /** Applies a solid border to the text. */
  public border(width: number, color: number, style = TextBorderStyle.Round): this {
    this.view.style.lineJoin = style;
    this.view.style.stroke = color;
    this.view.style.strokeThickness = width;

    return this;
  }

  /** Changes the font family of the text. */
  public font(family: string, size: number, color: number): this {
    this.view.style.fontFamily = family;
    this.view.style.fontSize = size;
    this.view.style.fill = color;

    return this;
  }

}
