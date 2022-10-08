import { Text } from 'pixi.js';
import { UiWidget } from './ui-widget';


export class UiText implements UiWidget {

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

  /**
   * @param value The text that should be rendered.
   * @param color Color in which the text should be rendered.
   * @param size Font size in px.
   */
  constructor(public value: string, public color = 0x000000, public size = 10) {
    this.view.text = value;
    this.view.resolution = 4;
  }

  /** @inheritDoc */
  public update(): void {
    this.view.style.fill = this.color;
    this.view.style.fontSize = this.size;
    this.view.style.fontFamily = 'Alagard';
    this.view.text = this.value;

    this.view.pivot.set(this.width >> 1, this.height >> 1);
  }

}
