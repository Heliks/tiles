import { Injectable, ProcessingSystem, Query, QueryBuilder, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';
import { Physics } from './physics';


/** Synchronizes `RigidBody` components with their counterpart in the physics world. */
@Injectable()
export class SyncBodies extends ProcessingSystem {

  /**
   * @param adapter The physics adapter.
   */
  constructor(private readonly adapter: Physics) {
    super();
  }

  /** @inheritDoc */
  public build(builder: QueryBuilder): Query {
    return builder.contains(RigidBody).contains(Transform).build();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies = world.storage(RigidBody);
    const transforms = world.storage(Transform);

    // Update entities with rigid bodies.
    for (const entity of this.query.entities) {
      const body = bodies.get(entity);
      const transform = transforms.get(entity);

      // If the entities world position was manually changed via the transform component,
      // mark the position as dirty so the adapter will update the body accordingly.
      body._position.dirty = !body._position.value.equals(transform.world);

      this.adapter.updateEntityBody(entity, body, transform);

      body._position.value.x = transform.world.x;
      body._position.value.y = transform.world.y;
    }
  }

}
