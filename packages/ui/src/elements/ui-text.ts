import { Text } from 'pixi.js';
import { Element } from '../element';
import { Input } from '../input';
import { Rect, Size } from '../layout';


export enum TextBorderStyle {
  Miter,
  Round,
  Bevel
}

/** Displays text. */
export class UiText implements Element {

  /**
   * Name of the default font that should be used for new {@link UiText} elements. The
   * font can be set individually on each element.
   */
  public static defaultFont = 'serif';

  @Input()
  public text = '';

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
   * @param size Font family
   */
  constructor(value: string, color = 0x000000, size = 10, family?: string) {
    this.text = value;
    this.view.style.fontSize = size;
    this.view.style.fill = color;
    this.view.style.fontFamily = family ?? UiText.defaultFont;
    this.view.resolution = 2;
  }

  /** @inheritDoc */
  public getContext(): object {
    return this;
  }

  /** @inheritDoc */
  public update(): void {
    this.view.text = this.text;
    this.size.width.value = this.view.width;
    this.size.height.value = this.view.height;
  }

  /**
   * Applies a border to the text.
   *
   * @param width Stroke width in px.
   * @param color Border color.
   * @param style Border style.
   */
  public stroke(width = 1, color = 0x000000, style = TextBorderStyle.Round): this {
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

  /**
   * Applies a drop shadow to the text.
   *
   * @param blur Blur distance in px.
   * @param distance Distance from the text in px.
   * @param angle Angle in radians.
   */
  public shadow(blur: number, distance = 0, angle = 0): this {
    this.view.style.dropShadow = true;
    this.view.style.dropShadowBlur = blur;
    this.view.style.dropShadowDistance = distance;
    this.view.style.dropShadowAngle = angle;

    return this;
  }

}
