import { Entity, World } from '@heliks/tiles-engine';
import { UiNode } from '@heliks/tiles-ui';
import { Element } from '../metadata';
import { ElementFactory } from '../tag-registry';


@Element('span')
export class Span implements ElementFactory {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(new UiNode());
  }

}
