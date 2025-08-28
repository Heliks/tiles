import { Entity, QueryEvent, World } from '@heliks/ecs';
import { Subscriber } from '@heliks/event-queue';
import { ProcessingSystem } from './processing-system';


/**
 * System that tracks the addition or removal of entities that share a common set
 * of components.
 *
 * @example
 *
 * ```ts
 * class LobbySystem extends ReactiveSystem {
 *   // Defines which entities are tracked by this system.
 *   public build(builder: QueryBuilder): Query {
 *     return builder.contains(Player).contains(Transform).build();
 *   }
 *
 *   // Handle players being added to the world.
 *   public onEntityAdded(world: World, entity: Entity): void {
 *     console.log(`Player ${entity} has entered.`);
 *   }
 *
 *   // Handle players being removed from the world.
 *   public onEntityRemoved(world: World, entity: Entity): void {
 *     console.log(`Player ${entity} has left.`);
 *   }
 * }
 * ```
 *
 * @remarks
 *
 * When implementing `update()`, `super.update(world)` must be called, otherwise no
 * changes in the entity pool are processed. Additionally, it may lead to memory leaks
 * as the internal event-queue is never consumed.
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
