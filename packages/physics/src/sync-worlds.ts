import { ComponentEventType, Inject, Injectable, Subscriber, System, Transform, World } from '@tiles/engine';
import { RigidBody } from './rigid-body';
import { ADAPTER_TK, PhysicsAdapter } from './physics-adapter';

/**
 * Synchronizes the entity world with the physics world. E.g. it spawns a body when a
 * `RigidBody` component is added to an entity and de-spawns it again when it is removed.
 */
@Injectable()
export class SyncWorlds implements System {

  /** Listens to component events on `Storage<RigidBody>`. */
  protected body$!: Subscriber;

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
    const _bodies = world.storage(RigidBody);
    const _transform = world.storage(Transform);

    for (const event of _bodies.events().read(this.body$)) {
      switch (event.type) {
        case ComponentEventType.Added:
          this.adapter.createBody(
            event.entity,
            _bodies.get(event.entity),
            _transform.get(event.entity).toVec2()
          );
          break;
        case ComponentEventType.Removed:
          this.adapter.destroyBody(event.entity);
          break;
      }
    }
  }

}
