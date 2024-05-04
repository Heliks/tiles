import { Entity } from '@heliks/tiles-engine';
import { Attribute } from './attribute';
import { AttributeBinding } from './attribute-binding';
import { Binding, ContextRef, PassByReference, PassByValue } from './context';
import { parseObjectPath } from './context/utils';
import { Element } from './element';
import { getInputs } from './input';


/**
 * Component that renders a {@link Element} on entities that are a {@link UiNode}.
 *
 * Elements add additional behavior to the node to which they are attached to. Like HTML,
 * they are building blocks for higher level UI composition.
 *
 * - `C`: The elements' context type. Usually this is the element itself.
 */
export class UiElement<C extends object = object, E extends Element<C> = Element<C>> {

  /**
   * All {@link Attribute attributes} that are attached to this element. Attributes
   * are evaluated before the element itself and can additionally modify its behavior
   * or appearance.
   */
  public readonly attributes: AttributeBinding[] = [];

  /**
   * Contains all bindings for this element.
   *
   * Bindings are resolved before the element is updated.
   */
  public readonly bindings: Binding[] = [];

  /**
   * The elements' context reference to `C`. Will be available after the element is
   * spawned into the world.
   *
   * @see getContext
   */
  public context!: ContextRef;

  /**
   * The host owns the view reference with which this element will share data via inputs
   * and outputs. Top-level elements usually do not have a host, and subsequently, can't
   * share data upwards.
   *
   * @see Host
   */
  public host?: Entity;

  /**
   * @param instance Instance of the element that the node should render.
   */
  constructor(public readonly instance: E) {}

  /** @see Element.getContext */
  public getContext(): C {
    return this.instance.getContext();
  }

  /**
   * Adds an {@link Attribute} and binds the `key` of the local {@link context} reference
   * as the input that will be passed into the attribute.
   */
  public attr(key: string, attribute: Attribute): this {
    const input = getInputs(attribute)[0];

    this.attributes.push(new AttributeBinding(
      attribute,
      key,
      input
    ));

    return this;
  }

  /**
   * Binds a `host` property to an {@link Input} on the local {@link context}.
   *
   * This establishes a data-sharing relationship where the elements host context will
   * copy the value from the specified `host` property to the local context.
   *
   * It's possible to use an object path as `host` property.
   *
   * ```ts
   *  element.bind('foo', 'foo.bar');
   * ```
   *
   * Note: This is not supported for the `local` key, as only direct properties can be
   * declared as inputs.
   */
  public bind(local: string, host: string): this {
    this.bindings.push(new PassByReference(local, parseObjectPath(host)));

    return this;
  }

  /**
   * Binds a static `value` to an {@link Input} on the `local` {@link context}. The value will
   * be shared with the elements local {@link context}.
   */
  public value(local: string, value: unknown): this {
    this.bindings.push(new PassByValue(local, value));

    return this;
  }

  /**
   * Resolves all bindings, using the given `host` element as context host.
   *
   * Inputs of the elements {@link context} reference will receive data from the context
   * reference of the `host` element. Outputs will send data to it instead.
   */
  public share(host: UiElement): void {
    for (const binding of this.bindings) {
      binding.resolve(this.context, host.context);
    }
  }

}
