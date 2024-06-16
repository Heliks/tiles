import { Entity, Parent, World } from '@heliks/tiles-engine';
import { UiElement } from '../ui-element';


/**
 * Marks a context host on an entity that is a {@link UiElement}.
 *
 * Elements that are children of the entity who owns this component, will share data
 * with the owners {@link ContextRef}. Each child will use the first host encountered
 * when going up its parent chain.
 *
 * ```md
 *  - ElementA (host)
 *    - ElementB            <--- Host is ElementA
 *      - ElementC (host)   <--- Host is ElementA
 *        - ElementD        <--- Host is ElementC
 * ```
 */
export class Host {

  /**
   * Returns the appropriate context host for the given `entity`. Returns `undefined`
   * if the entity does not have a host.
   */
  public static get(world: World, entity: Entity): Entity | undefined {
    const parents = world.storage(Parent);
    const hosts = world.storage(Host);

    if (parents.has(entity)) {
      const parent = parents.get(entity).entity;

      if (hosts.has(parent)) {
        return parent;
      }
      else {
        return Host.get(world, parent);
      }
    }
  }

  /**
   * Assigns the appropriate context host to the element of `entity`. The host will
   * immediately share data with the elements' context.
   */
  public static setup(world: World, entity: Entity): boolean {
    const host = Host.get(world, entity);

    if (host === undefined) {
      return false;
    }

    const elements = world.storage(UiElement);
    const element = elements.get(entity);

    element.host = host;
    element.share(elements.get(host));

    return true;
  }

}
