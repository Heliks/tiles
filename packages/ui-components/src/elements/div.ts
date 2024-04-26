import { Entity, World } from '@heliks/tiles-engine';
import { Rect, Size, UiNode } from '@heliks/tiles-ui';
import { Element } from '../metadata';
import { ElementFactory } from '../tag-registry';


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
