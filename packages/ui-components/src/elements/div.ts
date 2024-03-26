import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size, UiNode } from '@heliks/tiles-ui';
import { Element, ElementFactory } from '../element';


@Element('div')
export class Div implements ElementFactory {

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
