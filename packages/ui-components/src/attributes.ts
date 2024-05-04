import { Entity, World } from '@heliks/tiles-engine';
import { UiElement, UiNode } from '@heliks/tiles-ui';
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
      if (typeof value !== 'string') {
        throw new Error('Value must be the name of a property on the host component.');
      }

      element.bind(local, value);
      break;
  }
}

/**
 * Binds all `attributes` that are {@link AttributeContextBindingParams} to the context
 * of the {@link UiElement} owned by the given `entity`. Attributes that do not bind to
 * the element context will be ignored.
 */
export function setContextBindingsFromJsxAttributes(world: World, entity: Entity, attributes: Attributes): void {
  const element = world.storage(UiElement).get(entity);

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

  if (world.storage(UiElement).has(owner)) {
    setContextBindingsFromJsxAttributes(world, owner, attributes);
  }
}
