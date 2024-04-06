import { Entity, World } from '@heliks/tiles-engine';
import { UiElement } from '@heliks/tiles-ui';
import { Attributes } from '../jsx';


/**
 * Keywords in JSX attribute namespaces that declare how the value of the attribute
 * should be bound to the JSX elements context, e.g. `<div name:keyword></div>`.
 */
export enum AttributeContextBindingKeyword {

  /**
   * Value passed into the attribute is treated as the name of the property of the local
   * component that is bound to an @Input() on the JSX element.
   */
  OneWay = 'bind',

  /**
   * Value passed into the attribute is directly bound to an @Input() on the JSX
   * element.
   */
  Value = 'value'

}

/**
 * Parameters extracted from an attribute that wants to bind its value to the context
 * of the JSX element, e.g. `<div name:type></div>`.
 */
export type AttributeContextBindingParams = [name: string, type: AttributeContextBindingKeyword];

/**
 * Extracts {@link AttributeContextBindingParams} from the given attribute `name`. The
 * name should be in a namespace format, e.g., `name:namespace`. Returns `undefined` if
 * no params can be extracted.
 */
export function getAttributeContextBindingParams(name: string): AttributeContextBindingParams | undefined {
  const binding = name.split(':') as AttributeContextBindingParams;

  if (binding.length === 2) {
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
export function setContextBindingsFromAttributes(world: World, entity: Entity, attributes: Attributes): void {
  const element = world.storage(UiElement).get(entity);

  for (const name in attributes) {
    const params = getAttributeContextBindingParams(name);

    if (params) {
      setContextBinding(element, params[0], attributes[name], params[1]);
    }
  }
}
