import { Entity, Type, World } from '@heliks/tiles-engine';
import { LayerId } from '@heliks/tiles-pixi';
import { fill, UiElement, UiNode } from '@heliks/tiles-ui';
import { JsxRenderer } from './jsx-renderer';
import { UiComponent } from './ui-component';


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

/** Returns the {@link UiComponent} instance of the given entity. */
export function getUiComponent<C extends UiComponent>(world: World, entity: Entity): C {
  return world
    .storage(UiElement<object, JsxRenderer<C>>)
    .get(entity)
    .instance
    .instance
}

/**
 * Creates the given `component` and returns its entity.
 *
 * Components created by the function will use the entire screen (100%x100%) as
 * available space.
 *
 * @param world World in which the component should be created.
 * @param component UI component.
 * @param layer ID of the renderer layer on which the component should be rendered.
 * @param params A map of {@link Input} parameters that will be bound to the component
 *  as {@link PassByValue value}.
 *
 * @return The components' entity.
 */
export function createUi<C extends UiComponent>(world: World, component: Type<C>, layer: LayerId, params?: Partial<C>): Entity {
  const element = new UiElement(new JsxRenderer(component));

  if (params) {
    for (const key in params) {
      element.value(key, params[key]);
    }
  }

  return world
    .create()
    .use(element)
    .use(
      new UiNode({
        layer,
        size: fill()
      })
    )
    .build()
}
