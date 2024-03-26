import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size, UiNode } from '@heliks/tiles-ui';
import { Element, ElementFactory } from '../element';


/** Block tag that fills 100% x 100% of its available space by default. */
@Element('fill')
export class Fill implements ElementFactory {

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
