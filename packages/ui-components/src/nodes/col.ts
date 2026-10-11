import { Entity, World } from '@heliks/tiles-engine';
import { block, FlexDirection, UiNode } from '@heliks/tiles-ui';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


@Tag('col')
export class Col implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(
      new UiNode({
        direction: FlexDirection.Column,
        size: block()
      })
    );
  }

}
