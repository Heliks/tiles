import { Text } from 'pixi.js';
import { UiWidget } from '../ui-widget';


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
  public get width(): number {
    return this.view.width;
  }

  /** @inheritDoc */
  public get height(): number {
    return this.view.height;
  }

  public set font(font: string) {
    this.view.style.fontFamily = font;
  }

  public get font(): string {
    return this.view.style.fontFamily;
  }

  /**
   * @param value The text that should be rendered.
   * @param color Color in which the text should be rendered.
   * @param fontSize Font size in px.
   */
  constructor(public value: string, public color = 0x000000, public fontSize = 10) {
    this.view.text = value;
    this.view.resolution = 4;
    this.view.style.fontFamily = UiText.defaultFont;
  }

  /** @inheritDoc */
  public update(): void {
    this.view.style.fill = this.color;
    this.view.style.fontSize = this.fontSize;
    this.view.text = this.value;
  }

}
