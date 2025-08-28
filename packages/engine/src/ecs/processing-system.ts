import { Query, QueryBuilder, System, World } from '@heliks/ecs';


/**
 * System that iterates over entities that share a set of common components.
 *
 * Processes entities based on their component composition.
 *
 * Pools entities based on their composition for further processing. This is useful if we
 * want to iterate over entities that all match a certain set of components.
 *
 * @example
 *
 * A movement system might want to iterate over all entities that have both a `Transform`
 * and a `Velocity` component. An example implementation of that could look like this:
 *
 * ```ts
 *  class MoveEntities extends ProcessingSystem {
 *    public query(query: QueryBuilder): Query {
 *      return query.contains(Transform).contains(Velocity).build();
 *    }
 *
 *    public update(world: World): void {
 *      for (const entity of this.query.entities) {
 *        const transform = world.storage(Transform).get(entity);
 *        const velocity = world.storage(Velocity).get(entity);
 *
 *        transform.x += velocity.x;
 *        transform.y += velocity.y;
 *      }
 *    }
 * }
 * ```
 */
export abstract class ProcessingSystem implements System {

  /**
   * Query that matches the entities for this system.
   *
   * @remarks
   *
   * The query is only available after the system has been booted. Attempting to access
    * it before boot will result in undefined behavior.
   */
  protected query!: Query;

  /** Builds and returns the {@link query} configuration for this system. */
  public abstract build(query: QueryBuilder): Query;

  /** @inheritDoc */
  public abstract update(world: World): unknown;

  /** @inheritDoc */
  public boot(world: World): void {
    this.query = this.build(world.query());
  }

}
