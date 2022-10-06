import { ComponentType, Entity, ENTITY_BITS, ENTITY_MASK, World } from '@heliks/ecs';


/**
 * Reference to an entity.
 */
export class EntityRef<C = unknown> {

  constructor(public readonly world: World, public readonly entity: Entity) {}

  /**
   * Returns the ID of {@link entity}. The ID is equivalent with the index that the
   * entity occupies.
   */
  public id(): number {
    return this.entity & ENTITY_MASK;
  }

  /**
   * Returns the version of {@link entity}.
   *
   * @see ENTITY_BITS
   */
  public version(): number {
    return this.entity >> ENTITY_BITS;
  }

  /**
   * @param type
   */
  public get<T extends C>(type: ComponentType<T>): T {
    return this.world.storage(type).get(this.entity);
  }

}

