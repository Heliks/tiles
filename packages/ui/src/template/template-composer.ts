import { Entity, Parent, Type, World } from '@heliks/tiles-engine';
import { Element } from '../element';
import { TemplateElement, UiComponentRenderer, UiText } from '../elements';
import { Style } from '../style';
import { UiComponent } from '../ui-component';
import { UiElement } from '../ui-element';
import { UiNode } from '../ui-node';
import { DefaultRenderer } from './default-renderer';
import { ElementComposer } from './element-composer';
import { BaseTemplateComposer, TemplateFactory } from './types';


/** Utility for high-level UI composition. */
export class TemplateComposer implements BaseTemplateComposer {

  constructor(public readonly world: World, public readonly entity: Entity) {}

  /** Returns the {@link UiNode} component of the composed {@link entity}. */
  private getNode(): UiNode {
    return this.world.storage(UiNode).get(this.entity);
  }

  /** @inheritDoc */
  public use(component: object): this {
    this.world.attach(this.entity, component);

    return this;
  }

  /** @internal */
  private _child(): TemplateComposer {
    return new TemplateComposer(
      this.world,
      this.world.insert(
        new UiNode(),
        new Parent(this.entity)
      )
    );
  }

  /** @inheritDoc */
  public child(factory: TemplateFactory<TemplateComposer>): this {
    factory(this._child());

    return this;
  }

  /** @inheritDoc */
  public style(style: Partial<Style>): this {
    Object.assign(this.getNode().style, style);

    return this;
  }

  /** @inheritDoc */
  public listen(): this {
    this.getNode().interactive = true;

    return this;
  }

  /** @inheritDoc */
  public build(): Entity {
    return this.entity;
  }

  /** Changes the node into an {@link UiElement element}. */
  public element(element: Element): ElementComposer<TemplateComposer> {
    const component = new UiElement(element);

    return new ElementComposer(this.use(component), component)
  }

  /** Shorthand for changing the node into a {@link UiComponentRenderer} element. */
  public component(type: Type<UiComponent>): ElementComposer<TemplateComposer> {
    return this.element(new UiComponentRenderer(type));
  }

  /** Shorthand for changing the node into a {@link TemplateElement} element. */
  public template(factory: TemplateFactory<TemplateComposer>): ElementComposer<TemplateComposer> {
    return this.element(new TemplateElement(new DefaultRenderer(this._child(), factory)))
  }

  /** Shorthand for changing the node into a {@link UiText} element. */
  public text(text: string, color?: number, size?: number, family?: string): ElementComposer<TemplateComposer> {
    return this.element(new UiText(text, color, size, family));
  }

}


