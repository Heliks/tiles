import { ComponentType, Entity, ENTITY_BITS, ENTITY_MASK, World } from '@heliks/ecs';


/**
 * Reference to an entity.
 */
export class EntityRef<C = unknown> {

  /**
   * @param world World in which the entity exists.
   * @param entity The entity that is being referenced.
   */
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

  /** Returns the component of type `T` of which {@link entity} is the owner. */
  public get<T extends C>(type: ComponentType<T>): T {
    return this.world.storage(type).get(this.entity);
  }

  /** Destroys the referenced entity. */
  public destroy(): void {
    this.world.destroy(this.entity);
  }

}

