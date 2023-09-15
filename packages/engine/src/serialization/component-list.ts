import { ComponentType, Entity } from '@heliks/ecs';
import { World } from '../ecs';


/**
 * A list of components.
 *
 * Each component type is unique, which means that a component list can only hold one
 * component of a certain component type.
 */
export class ComponentList {

  /** Component instances. Limited to one per component type. */
  private readonly items: object[] = [];

  /**
   * Adds a `component` to the list. If a component of that {@link ComponentType type}
   * already exists, it will not be added. Returns `true` if the component was added to
   * the list successfully.
   */
  public add(component: object): boolean {
    if (this.find(component.constructor as ComponentType)) {
      return false;
    }

    this.items.push(component);

    return true;
  }

  /** Returns the component of `type` from the list, if any. */
  public find<T>(type: ComponentType<T>): T | undefined {
    return this.items.find(item => item instanceof type) as T;
  }

  /**
   * Returns the component of `type` from the list. Throws if no component of such type
   * exists within this list.
   */
  public get<T>(type: ComponentType<T>): T {
    const component = this.find(type);

    if (! component) {
      throw new Error(`No component: ${type}`);
    }

    return component;
  }

  /**
   * Creates a new entity in the given `world` & attaches all components in this
   * list to it.
   */
  public entity(world: World): Entity {
    return world.insert(...this.items);
  }

}