import { ComponentEventType, Injectable, Subscriber, System, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';
import { Physics } from './physics';

/**
 * Synchronizes the entity world with the physics world. E.g. it spawns a body when a
 * `RigidBody` component is added to an entity and de-spawns it again when it is removed.
 */
@Injectable()
export class SyncWorlds implements System {

  /** @internal */
  private body$!: Subscriber;

  /**
   * @param physics The physics adapter.
   */
  constructor(private readonly physics: Physics) {}

  /** @inheritDoc */
  public boot(world: World): void {
    // Subscribe to changes in the rigid body storage.
    this.body$ = world.storage(RigidBody).events().subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    const bodies = world.storage(RigidBody);
    const transforms = world.storage(Transform);

    for (const event of bodies.events().read(this.body$)) {
      switch (event.type) {
        case ComponentEventType.Added:
          this.physics.createBody(
            event.entity,
            bodies.get(event.entity),
            transforms.get(event.entity)
          );
          break;
        case ComponentEventType.Removed:
          this.physics.destroyBody(event.entity);
          break;
      }
    }
  }

}
