import { Entity, Type, World } from '@heliks/tiles-engine';
import { Element, UiElement, UiNode } from '@heliks/tiles-ui';
import { ResourceMetadata } from './metadata';
import { UiNodeRenderer } from './ui-node-renderer';


/** Default renderer for tags that display a {@link UiElement}. */
export class UiElementRenderer implements UiNodeRenderer {

  constructor(public readonly type: Type<Element>, public readonly meta: ResourceMetadata) {}

  /** @inheritDoc */
  public render(world: World): Entity {
    return world.insert(
      new UiNode(this.meta.options.style),
      new UiElement(
        world.make(this.type)
      )
    );
  }

}
