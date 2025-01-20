import { Node, rect } from '@heliks/flex';
import { Entity, World } from '@heliks/tiles-engine';
import { Text } from 'pixi.js';
import { Element } from '../element';
import { Input } from '../input';
import { OnInit } from '../lifecycle';
import { Style } from '../style';
import { TextFactory } from '../text-factory';


export enum TextBorderStyle {
  Miter,
  Round,
  Bevel
}

/** Displays text. */
export class UiText implements Element, OnInit {

  /**
   * Name of the default font that should be used for new {@link UiText} elements. The
   * font can be set individually on each element.
   */
  public static defaultFont = 'serif';

  /** The text that is displayed by this element. */
  @Input()
  public text = '';

  /** @inheritDoc */
  public readonly size = rect(0);

  /** @inheritDoc */
  public readonly view = new Text('', {
    align: 'left'
  });

  /** @internal */
  private _parser!: TextFactory;

  /**
   * @param value The text that should be rendered.
   * @param color Color in which the text should be rendered.
   * @param size Font size in px.
   * @param family Font family
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
  public onInit(world: World): void {
    this._parser = world.get(TextFactory);
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity, layout: Node<Style>): void {
    this.view.text = this.text;

    this.size.width.value = this.view.width;
    this.size.height.value = this.view.height;

    if (layout.style.text) {
      this._parser.parse(layout.style.text, this.view.style);

      if (layout.style.text.wrap && layout.parent) {
        this.view.style.wordWrapWidth = layout.parent.size.width;
      }
    }
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
