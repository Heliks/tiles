import { Entity } from '@heliks/tiles-engine';
import { Attribute } from './attribute';
import { AttributeBinding } from './attribute-binding';
import { ContextRef } from './context';
import { Binding } from './context/binding';
import { PassByReference } from './context/pass-by-reference';
import { PassByValue } from './context/pass-by-value';
import { Element } from './element';
import { getInputs } from './params';


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
   * Bindings are relationships between this elements' {@link context} reference and the
   * reference of its context {@link Host} and decide which data is shared between them
   * via inputs and outputs.
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
   * Binds the given `local` key of the elements {@link context} reference to the key
   * on the context reference of the elements' {@link host}, establishing data-sharing
   * between the context of this element and the context of its host.
   *
   * If the `local` key is an input, the elements' context reference will receive data
   * from the host reference. If it's an output, the host will receive data from the
   * elements' context instead.
   */
  public bind(local: string, host: string): this {
    this.bindings.push(new PassByReference(local, host));

    return this;
  }

  /**
   * Binds a static `value` to the key of the elements {@link context} reference. The
   * value will be shared with the reference if the `local` key is an input.
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
