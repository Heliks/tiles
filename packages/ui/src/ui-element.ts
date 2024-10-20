import { Entity } from '@heliks/tiles-engine';
import { Binding, ContextRef, PassByFunction, PassByFunctionCallback, PassByReference, PassByValue } from './context';
import { parseObjectPath } from './context/utils';
import { Element } from './element';


/** Values that can be passed into {@link UiElement.bind()}. */
export type UiElementBindingValue = string | PassByFunctionCallback;

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
   * Binds the given function `fn` to a `local` {@link Input}.
   *
   * Binding a function will cause it to be called once on each frame. The return value
   * is then passed into the local input.
   *
   * ```ts
   * element.bind('foo', () => Math.random());
   * ```
   */
  public bind(local: string, fn: PassByFunctionCallback): this;

  /**
   * Binds a `host` property to a `local` {@link Input}.
   *
   * This causes the host context to share the value of the host property with the
   * local input.
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
  public bind(local: string, host: string): this;

  /** @internal */
  public bind(local: string, host: UiElementBindingValue): this {
    this.bindings.push(
      typeof host === 'string'
        ? new PassByReference(local, parseObjectPath(host))
        : new PassByFunction(local, host)
    );

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

  /** Resolves all data {@link bindings} to the local {@link context}. */
  public resolve(host?: ContextRef): void {
    for (const binding of this.bindings) {
      binding.resolve(this.context, host);
    }
  }

}
