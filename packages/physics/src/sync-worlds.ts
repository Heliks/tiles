import { ComponentEventType, Inject, Injectable, Subscriber, System, Transform, World } from '@heliks/tiles-engine';
import { RigidBody } from './rigid-body';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';

/**
 * Synchronizes the entity world with the physics world. E.g. it spawns a body when a
 * `RigidBody` component is added to an entity and de-spawns it again when it is removed.
 */
@Injectable()
export class SyncWorlds implements System {

  /** @internal */
  private body$!: Subscriber;

  /**
   * @param adapter The physics adapter.
   */
  constructor(@Inject(ADAPTER_TK) private readonly adapter: PhysicsAdapter) {}

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
          this.adapter.createBody(
            event.entity,
            bodies.get(event.entity),
            transforms.get(event.entity)
          );
          break;
        case ComponentEventType.Removed:
          this.adapter.destroyBody(event.entity);
          break;
      }
    }
  }

}
