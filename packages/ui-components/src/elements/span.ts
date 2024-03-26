import { Entity, World } from '@heliks/tiles-engine';
import { UiNode } from '@heliks/tiles-ui';
import { Element, ElementFactory } from '../element';


@Element('div')
export class Span implements ElementFactory {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(new UiNode());
  }

}
