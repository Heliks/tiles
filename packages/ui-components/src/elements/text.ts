import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode, UiText } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Element } from '../metadata';
import { TextStyle } from '../style';
import { ElementFactory } from '../tag-registry';


/**
 * Displays a text.
 *
 * This element should only be used when you want to bind a text that dynamically
 * changes in value. For everything else, the JSX renderer supports using strings
 * directly in templates:
 *
 * ```tsx
 *  const foo = <div>Hello World></div>;
 * ```
 */
@Element('text')
export class Text implements ElementFactory {

  /** @inheritDoc */
  public render(world: World, attributes: Attributes, style?: TextStyle): Entity {
    // The actual text will be set via inputs.
    const text = new UiText('');

    if (style) {
      text.view.style = style;
    }

    return world.insert(new UiNode(), new UiElement(text));
  }

}
