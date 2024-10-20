import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size, UiNode } from '@heliks/tiles-ui';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


@Tag('div')
export class Div implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(
      new UiNode({
        size: new Rect<Size>(
          Size.percent(1),
          Size.auto()
        )
      })
    );
  }

}
