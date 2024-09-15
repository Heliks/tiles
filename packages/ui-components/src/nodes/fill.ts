import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size, UiNode } from '@heliks/tiles-ui';
import { Tag } from '../metadata';
import { UiNodeRenderer } from '../ui-node-renderer';


/** Block tag that fills 100% x 100% of its available space by default. */
@Tag('fill')
export class Fill implements UiNodeRenderer {

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(
      new UiNode({
        size: new Rect<Size>(
          Size.percent(1),
          Size.percent(1)
        )
      })
    );
  }

}
