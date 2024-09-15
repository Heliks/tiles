import { Entity, World } from '@heliks/tiles-engine';
import { UiNode } from '@heliks/tiles-ui';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


@Tag('span')
export class Span implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(new UiNode());
  }

}
