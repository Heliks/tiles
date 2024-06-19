import { Entity, World } from '@heliks/tiles-engine';
import { UiElement } from '@heliks/tiles-ui';
import { JsxRenderer } from './jsx-renderer';


/**
 * Invalidates the {@link UiComponent} that is owned by the given `entity`, which
 * causes the component to be re-rendered on the same frame. Throws an error if
 * entity does not own a UI component.
 */
export function invalidate(world: World, entity: Entity): void {
  const component = world.storage(UiElement).get(entity).instance;

  if (!(component instanceof JsxRenderer)) {
    throw new Error(`Element owned by ${entity} is not a component.`);
  }

  component.invalid = true;
}
