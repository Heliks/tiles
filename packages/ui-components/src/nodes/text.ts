import { Entity, World } from '@heliks/tiles-engine';
import { TextStyle, UiElement, UiNode, UiText } from '@heliks/tiles-ui';
import { Attributes } from '../jsx-node';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/**
 * Displays a text.
 *
 * This tag should only be used when you want to bind a text that dynamically changes
 * in value. For everything else, the JSX renderer supports using strings directly in
 * templates:
 *
 * ```tsx
 *  const foo = <div>Hello World></div>;
 * ```
 */
@Tag('text')
export class Text implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World, attributes: Attributes, style?: TextStyle): Entity {
    // The actual text will be set via inputs.
    const text = new UiText('');

    return world.insert(new UiNode({ text: style }), new UiElement(text));
  }

}
