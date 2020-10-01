import { Entity, GroupEvent, Subscriber, World } from '@heliks/ecs';
import { ProcessingSystem } from './processing-system';

/** A system that reacts to changes in an entity group. */
export abstract class ReactiveSystem extends ProcessingSystem {

  /** @internal */
  private _subscriber!: Subscriber;

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
    this._subscriber = this.group.subscribe();
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const event of this.group.events(this._subscriber)) {
      if (event.type === GroupEvent.Added) {
        this.onEntityAdded(world, event.entity);
      }
      else {
        this.onEntityRemoved(world, event.entity);
      }
    }
  }

}
