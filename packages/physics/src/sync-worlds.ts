import { Entity, Injectable, Query, QueryBuilder, ReactiveSystem, Transform, World } from '@heliks/tiles-engine';
import { Physics } from './physics';
import { RigidBody } from './rigid-body';


/**
 * Synchronizes the entity world with the physics world. E.g. it spawns a body when a
 * `RigidBody` component is added to an entity and de-spawns it again when it is removed.
 */
@Injectable()
export class SyncWorlds extends ReactiveSystem {

  /**
   * @param physics The physics adapter.
   */
  constructor(private readonly physics: Physics) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query.contains(RigidBody).build();
  }

  /** @inheritDoc */
  public onEntityAdded(world: World, entity: Entity): void {
    const bodies = world.storage(RigidBody);
    const transforms = world.storage(Transform);

    this.physics.createBody(
      entity,
      bodies.get(entity),
      transforms.get(entity)
    );
  }

  /** @inheritDoc */
  public onEntityRemoved(world: World, entity: Entity): void {
    this.physics.destroyBody(entity);
  }

}
