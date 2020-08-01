import { EntityGroup, Query, System, World } from '@tiles/entity-system';

export abstract class ProcessingSystem implements System {

  /**
   * An entity group that only contains entities that match the constrains
   * declared via [[getQuery]]. The group is created after booting.
   */
  protected group!: EntityGroup;

  /**
   * Returns an entity query that describes which entities are allowed in
   * the [[group]] of this system.
   */
  public abstract getQuery(): Query;

  /** @inheritDoc */
  public boot(world: World): void {
    // Query all entities and cache the resulting group for later use.
    this.group = world.query(this.getQuery());
  }

  /** @inheritDoc */
  public abstract update(world: World): unknown;

}
