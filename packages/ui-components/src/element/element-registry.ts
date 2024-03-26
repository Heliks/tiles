import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode } from '@heliks/tiles-ui';
import { Attributes } from '../jsx';


/**
 * Transforms a JSX node into an entity with a {@link UiNode} component. Additional
 * settings may be made to the node or an {@link UiElement} component may be added,
 * depending on the implementation of the element.
 */
export interface ElementFactory<A extends Attributes = Attributes> {

  /**
   * Called to render a JSX element (e.g. <div>, <span>, etc.). The entity that is
   * produced by this function *must* have a {@link UiNode} component.
   *
   * @param world Entity world
   * @param attributes Attributes for the element to create.
   */
  render(world: World, attributes: A): Entity;

}


export class ElementRegistry {

  private readonly factories = new Map<string, ElementFactory>();

  public add(tag: string, renderer: ElementFactory): this {
    this.factories.set(tag, renderer);

    return this;
  }

  public tag(tag: string): ElementFactory | undefined {
    return this.factories.get(tag);
  }

}




