import { Node, rect } from '@heliks/flex';
import { Entity, World } from '@heliks/tiles-engine';
import { Text } from 'pixi.js';
import { Element } from '../element';
import { Input } from '../input';
import { OnInit } from '../lifecycle';
import { Style } from '../style';
import { TextFactory } from '../text-factory';


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
  public onInit(world: World): void {
    this._parser = world.get(TextFactory);
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity, layout: Node<Style>): void {
    if (layout.style.text) {
      this._parser.parse(layout.style.text, this.view.style);
    }

    this.view.text = this.text;
    this.size.width.value  = this.view.width;
    this.size.height.value = this.view.height;
  }

  /** @inheritDoc */
  public postprocess(world: World, entity: Entity, layout: Node<Style>): void {
    // Todo: This is a chicken and egg problem. We can only wrap in post-process because
    //  the layout must be fully calculated to determine how much space we have available
    //  to wrap into, but breaking text into multiple lines can also affect the layout
    //  if the node that contains it has a dynamic height (auto, percentage). Therefore,
    //  this code causes the wrapping to take effect one frame too late.
    if (layout.style.text?.wrap && layout.parent) {
      this.view.style.wordWrap = true;
      this.view.style.wordWrapWidth = layout.parent.size.width;
    }
  }

}
