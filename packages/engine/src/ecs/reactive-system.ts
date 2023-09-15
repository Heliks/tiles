import { Entity, QueryEvent, Subscriber, World } from '@heliks/ecs';
import { ProcessingSystem } from './processing-system';


/**
 * A system that pools entities and reacts to changes in that pool.
 *
 * If you need to implement logic into a reactive system, you must call the parents
 * update via `super.update(world)` or else changes in the entity pool will not be
 * processed properly. This can also cause memory leaks, as the event queue that
 * contains the updates will never be consumed.
 */
export abstract class ReactiveSystem extends ProcessingSystem {

  /** @internal */
  private _subscriber!: Subscriber<QueryEvent>;

  /** Called every time an entity is added to the systems entity group. */
  public abstract onEntityAdded(world: World, entity: Entity): void;

  /** Called every time an entity is removed from the systems entity group. */
  public abstract onEntityRemoved(world: World, entity: Entity): void;

  /** @inheritDoc */
  public boot(world: World): void {
    // Booting the ProcessingSystem will prepare the entity group to which we'll be
    // reacting to.
    super.boot(world);

    // Subscribe to added / removed entities.
    this._subscriber = this.query.events.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const event of this._subscriber.read()) {
      if (event.isAdded) {
        this.onEntityAdded(world, event.entity);
      }
      else {
        this.onEntityRemoved(world, event.entity);
      }
    }
  }

}
