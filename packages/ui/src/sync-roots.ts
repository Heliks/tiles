import { Storage, Parent, Subscriber, World, Entity, QueryEventType } from '@heliks/tiles-engine';
import { Query } from '@heliks/tiles-engine';
import { Stage } from '@heliks/tiles-pixi';
import { UiRoot } from './ui-root';


export class SyncRoots {

  /** @internal */
  private query!: Query;

  /** @internal */
  private subscription!: Subscriber;

  /**
   * @param stage Renderer stage.
   */
  constructor(private readonly stage: Stage) {}

  /** @inheritDoc */
  public onInit(world: World): void {
    this.query = world
      .query()
      .contains(UiRoot)
      .build();

    this.subscription = this.query.events.subscribe();
  }

  /** @internal */
  private add(parents: Storage<Parent>, roots: Storage<UiRoot>, entity: Entity): void {
    const component = roots.get(entity);

    if (parents.has(entity)) {
      const parent = parents.get(entity).entity;

      roots
        .get(parent)
        .container
        .addChild(component.container);
    }
    else {
      this.stage.add(component.container);
    }
  }

  /** @internal */
  private remove(roots: Storage<UiRoot>, entity: Entity): void {
    const root = roots.get(entity);

    root.container.parent?.removeChild(root.container);
  }

  /** @inheritDoc */
  public update(world: World): void {
    const roots = world.storage(UiRoot);
    const parents = world.storage(Parent);

    for (const event of this.query.events.read(this.subscription)) {
      switch (event.type) {
        case QueryEventType.Added:
          this.add(parents, roots, event.entity);
          break;
        case QueryEventType.Removed:
          this.remove(roots, event.entity);
          break;
      }
    }
  }

}
