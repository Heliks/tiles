import { ComponentType, Entity } from '@heliks/ecs';
import { World } from './world';


/**
 * A list of components.
 *
 * The list can only hold one instance per {@link ComponentType}.
 */
export class ComponentList {

  /**
   * Contains all component instances added to this list. This is guaranteed to only
   * contain one instance per component type.
   */
  private readonly items: object[] = [];

  /**
   * Creates a {@link ComponentList} from all components that the given `entity` owns
   * in the entity `world`.
   */
  public static from(world: World, entity: Entity): ComponentList {
    const list = new ComponentList();

    for (const type of world.components()) {
      const store = world.storage(type);

      if (store.has(entity)) {
        list.add(store.get(entity) as object);
      }
    }

    return list;
  }

  /** Returns the total number of components in this list. */
  public size(): number {
    return this.items.length;
  }

  /**
   * Adds a `component` to the list. Only one instance per {@link ComponentType} can be
   * added to this list. Returns `true` if the component was successfully added, or false
   * if its type already exists.
   */
  public add(component: object): boolean {
    if (this.find(component.constructor as ComponentType)) {
      return false;
    }

    this.items.push(component);

    return true;
  }

  /**
   * Returns the instance of the given component `type` from the list, or `undefined` if
   * no such type exists.
   */
  public find<T>(type: ComponentType<T>): T | undefined {
    return this.items.find(item => item instanceof type) as T;
  }

  /**
   * Returns the instance of the given component `type` from the list. Throws an error
   * if no such type exists.
   */
  public get<T>(type: ComponentType<T>): T {
    const component = this.find(type);

    if (! component) {
      throw new Error(`No component: ${type}`);
    }

    return component;
  }

  /** Creates an entity from all components that are added to this list. */
  public entity(world: World): Entity {
    return world.insert(...this.items);
  }

}
