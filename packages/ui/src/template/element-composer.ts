import { Entity, World } from '@heliks/tiles-engine';
import { Attribute } from '../attribute';
import { Style } from '../style';
import { UiElement } from '../ui-element';
import { ComposeNode, TemplateFactory } from './types';


export class ElementComposer<C extends ComposeNode> implements ComposeNode {

  /**
   * @param world Entity world in which the element is rendered.
   * @param entity Entity that owns the composed {@link element} component.
   * @param composer The base composer for the elements' node.
   * @param element The UI element that is being composed.
   */
  constructor(
    public readonly world: World,
    public readonly entity: Entity,
    public readonly composer: C,
    public readonly element: UiElement
  ) {}

  /** @inheritDoc */
  public style(style: Partial<Style>): this {
    this.composer.style(style);

    return this;
  }

  /** @inheritDoc */
  public insert(): ComposeNode {
    return this.composer.insert();
  }

  /** @inheritDoc */
  public child(factory: TemplateFactory<C>): this {
    this.composer.child(factory);

    return this;
  }

  /** @inheritDoc */
  public use(component: object): this {
    this.composer.use(component);

    return this;
  }

  /** @inheritDoc */
  public listen(): this {
    this.composer.listen();

    return this;
  }

  /** @inheritDoc */
  public build(): Entity {
    return this.composer.entity;
  }

  /**
   * Adds an {@link Attribute} and binds the `key` of the local {@link ContextRef} as the
   * input that will be passed into the attribute.
   */
  public attr(key: string, attribute: Attribute): this {
    this.element.attr(key as never, attribute);

    return this;
  }

  /**
   * Binds the given `local` key of the elements {@link ContextRef} to the key on the
   * context reference of the elements' {@link Host}, establishing data-sharing between
   * the context of this element and the context of its host.
   *
   * If the `local` key is an input, the elements' context reference will receive data
   * from the host reference. If it's an output, the host will receive data from the
   * elements' context instead.
   */
  public bind(local: string, host: string): this {
    this.element.bind(local, host);

    return this;
  }

  /**
   * Binds a static `value` to the key of the elements {@link ContextRef}. The
   * value will be shared with the reference if the `local` key is an input.
   */
  public value(local: string, value: unknown): this {
    this.element.value(local, value);

    return this;
  }

}
