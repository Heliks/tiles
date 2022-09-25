import { Query, QueryBuilder, System, World } from '@heliks/ecs';


/**
 * Pools entities based on their composition for further processing. This is useful if we
 * want to iterate over entities that all match a certain set of components.
 *
 * For example, a simple movement system might want to iterate over all entities that
 * have both a `Transform` and a `Velocity` component. An implementation of that would
 * look like this:
 *
 * ```ts
 *  class MoveEntities extends ProcessingSystem {
 *
 *    public query(builder: QueryBuilder): Query {
 *      return builder
 *        .contains(Transform)
 *        .contains(Velocity)
 *        .build();
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
 *
 * }
 * ```
 */
export abstract class ProcessingSystem implements System {

  /**
   * Contains the query that is created when {@link build} is called. The query and its
   * result are only available after the system has been successfully booted.
   */
  protected query!: Query;

  /**
   * Returns the query that is used to match entities to process. This is called during
   * the boot process of the system.
   */
  public abstract build(builder: QueryBuilder): Query;

  /** @inheritDoc */
  public abstract update(world: World): unknown;

  /** @inheritDoc */
  public boot(world: World): void {
    this.query = this.build(world.query());
  }

}
