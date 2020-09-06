import { ComponentType, EntityGroup, Query, System, World } from '@heliks/ecs';

/**
 * Utility function that returns an entity `Query` that matches all entities that
 * contain `components`.
 */
export function contains(...components: ComponentType[]): Query {
  return {
    contains: components
  };
}

/**
 * Convenience system that processes entities with a certain set of components.
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
   * An entity group that only contains entities that match the constrains declared via
   * [[query]]. The group is only available after the system was booted.
   */
  protected group!: EntityGroup;

  /**
   * @param query Query for matching entities that should be processed by this system.
   */
  protected constructor(private readonly query: Query) {}

  /** @inheritDoc */
  public abstract update(world: World): unknown;

  /** @inheritDoc */
  public boot(world: World): void {
    // Query all entities and cache the resulting group for later use.
    this.group = world.query(this.query);
  }

}
