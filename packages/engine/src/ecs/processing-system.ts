import { ComponentType, EntityGroup, EntityQuery, System, World } from '@heliks/ecs';

/**
 * Utility function that returns an entity `Query` that matches all entities that
 * contain `components`.
 */
export function contains(...components: ComponentType[]): EntityQuery {
  return {
    contains: components
  };
}

/**
 * System that pools entities based on their component identity.
 *
 * For example, iterating over all components with a `Transform` and `Velocity`
 * component:
 *
 * ```ts
 * class VelocitySystem extends ProcessingSystem {
 *
 *    constructor() {
 *      super(contains(Transform, Velocity));
 *    }
 *
 *    public update(): void {
 *      console.log(this.group.entities);
 *    }
 *
 * }
 * ```
 */
export abstract class ProcessingSystem implements System {

  /**
   * Group of entities that match the constrains of this systems [[query]]. The group
   * is only available after the system has been successfully booted.
   */
  protected group!: EntityGroup;

  /**
   * @param query Query for matching entities that should be processed by this system.
   */
  protected constructor(private readonly query: EntityQuery) {}

  /** @inheritDoc */
  public abstract update(world: World): unknown;

  /** @inheritDoc */
  public boot(world: World): void {
    // Query all entities and cache the resulting group for later use.
    this.group = world.query(this.query);
  }

}
