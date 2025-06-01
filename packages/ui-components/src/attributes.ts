import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode } from '@heliks/tiles-ui';
import { Rectangle } from 'pixi.js';
import { Data } from './data';
import { Attributes } from './jsx-node';
import { kebabToCamel } from './utils';


/**
 * Declares all available keywords in JSX attribute namespaces that define how its value
 * is bound to the context of the nodes {@link UiElement} component.
 *
 * ```jsx
 *  <div foo:keyword></div>
 * ```
 */
export enum AttributeContextBindingKeyword {

  /**
   * Value passed into the attribute is a string that contains an {@link ObjectPath}
   * to a property on the elements host context. The property is to be bound to the
   * local input matching the attribute name.
   */
  OneWay = 'bind',

  /** Value passed into the attribute is bound as value to the local context. */
  Value = 'value'

}

/**
 * Parameters extracted from an attribute that wants to bind its value to the context
 * of the JSX element, e.g. `<div name:type></div>`.
 */
export type AttributeContextBindingParams = [name: string, type: AttributeContextBindingKeyword];

/**
 * Extracts {@link AttributeContextBindingParams} from the given attribute `name`. The
 * name should be in a namespace format, e.g., `name:namespace`. If the attribute name
 * is in a kebab case format (`foo-bar:namespace`), it will be converted into camel
 * case (`fooBar:namespace`). Returns `undefined` if no params can be extracted.
 */
export function getAttributeContextBindingParams(name: string): AttributeContextBindingParams | undefined {
  const binding = name.split(':') as AttributeContextBindingParams;

  if (binding.length === 2) {
    // Convert name segment into camelCase.
    binding[0] = kebabToCamel(binding[0]);

    return binding;
  }
}

/**
 * Initializes context bindings for the given `element`.
 *
 * @param element Element on which the context binding should be set up.
 * @param local Local context property to which {@link value} will be bound to.
 * @param value The value that is being bound. If the {@link type} is not a value binding,
 *  this must be a string that contains the name of the host property that is being bound
 *  to the elements {@link name local} property.
 * @param type How the value should be bound.
 */
export function setContextBinding(element: UiElement, local: string, value: unknown, type: AttributeContextBindingKeyword): void {
  switch (type) {
    case AttributeContextBindingKeyword.Value:
      element.value(local, value);
      break;
    case AttributeContextBindingKeyword.OneWay:
      if (typeof value !== 'string' && typeof value !== 'function') {
        throw new Error('Value must be the name of a property on the host component or a callback function.');
      }

      // Safety: TS can not properly resolve this when casting to UiElementBindingValue.
      element.bind(local, value as string);
      break;
  }
}

/**
 * Binds all `attributes` that are {@link AttributeContextBindingParams} to the context
 * of the given UI `element`. Attributes that do not bind to the element context will be
 * ignored.
 */
export function setContextBindingsFromJsxAttributes(element: UiElement, attributes: Attributes): void {
  for (const name in attributes) {
    const params = getAttributeContextBindingParams(name);

    if (params) {
      setContextBinding(element, params[0], attributes[name], params[1]);
    }
  }
}

/**
 * Assigns the given JSX `attributes` to a UI `node`.
 *
 * Default attributes like `style` or `events` will be used as documented. Context
 * bindings like `foo:value` will be applied only if the `owner` has a {@link UiElement}
 * component. All other attributes are discarded.
 */
export function assignJsxAttributes(world: World, owner: Entity, node: UiNode, attributes: Attributes): void {
  // If node has the style attribute, assign it to the nodes original style.
  if (attributes.style) {
    Object.assign(node.layout.style, attributes.style);
  }

  if (attributes.events) {
    node.interactive = true;
  }

  node.name = attributes.name;

  // Hard check for `undefined` here because `false` and `0` is valid assignable data.
  if (attributes.data !== undefined) {
    world.attach(owner, new Data(attributes.data));
  }

  if (attributes.ref) {
    attributes.ref.entity = owner;
  }

  if (world.storage(UiElement).has(owner)) {
    const element = world.storage(UiElement).get(owner);

    setContextBindingsFromJsxAttributes(element, attributes);

    // Bubbling must be explicitly disabled.
    if (! attributes.bubble && attributes.bubble !== undefined) {
      // This appears to be a very naive way to implement event bubbling and may cause
      // unknown issues in the future. Needs some usage evaluation.
      element.instance.view.hitArea = Rectangle.EMPTY;
    }
  }
}
