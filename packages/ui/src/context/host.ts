import { Entity, Parent, World } from '@heliks/tiles-engine';
import { UiElement } from '../ui-element';


/**
 * Marks an entity with a {@link UiElement} component as a host context.
 *
 * Elements that are children of the owner of this component can share data with the
 * owners context. Each child will use the first host encountered in its parent tree.
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
    element.resolve(elements.get(host).context);

    return true;
  }

}
