import { Node, rect } from '@heliks/flex';
import { Entity, World } from '@heliks/tiles-engine';
import { BitmapText } from 'pixi.js';
import { Element } from '../element';
import { Input } from '../input';
import { Fonts } from '../fonts';
import { OnBeforeInit, OnDestroy } from '../lifecycle';
import { UiNode } from '../ui-node';
import { Style } from '../style';


/** Displays text using an installed bitmap font. */
export class UiText implements Element, OnBeforeInit, OnDestroy {

  /** The text that is displayed by this element. */
  @Input()
  public text = '';

  /** @inheritDoc */
  public readonly size = rect(0);

  /** @inheritDoc */
  public view!: BitmapText;

  /** Stores text without requiring fonts to be loaded until UI initialization. */
  constructor(value: string) {
    this.text = value;
  }

  /** Creates the view before the element manager attaches it to the node. */
  public onBeforeInit(world: World, entity: Entity): void {
    const node = world.storage(UiNode).get(entity);

    this.view = new BitmapText(this.text, world.get(Fonts).resolve(node.style.text));
  }

  /** Releases glyph display objects; shared bitmap font textures remain installed. */
  public onDestroy(): void {
    this.view.destroy({children: true});
  }

  /** @inheritDoc */
  public update(world: World, entity: Entity, layout: Node<Style>): void {
    world.get(Fonts).apply(this.view, layout.style.text);

    this.view.text = this.text;
    this.size.width.value  = this.view.textWidth;
    this.size.height.value = this.view.textHeight;
  }

  /** @inheritDoc */
  public postprocess(world: World, entity: Entity, layout: Node<Style>): void {
    // Todo: This is a chicken and egg problem. We can only wrap in post-process because
    //  the layout must be fully calculated to determine how much space we have available
    //  to wrap into, but breaking text into multiple lines can also affect the layout
    //  if the node that contains it has a dynamic height (auto, percentage). Therefore,
    //  this code causes the wrapping to take effect one frame too late.
    this.view.maxWidth = (layout.style.text?.wrap ?? world.get(Fonts).defaults.wrap) && layout.parent
      ? layout.parent.size.width
      : 0;
  }

}
