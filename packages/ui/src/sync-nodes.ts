import { Storage, Parent, Subscriber, World, Entity, QueryEventType, OnInit } from '@heliks/tiles-engine';
import { Query } from '@heliks/tiles-engine';
import { Stage } from '@heliks/tiles-pixi';
import { UiNode } from './ui-node';


export class SyncNodes implements OnInit {

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
      .contains(UiNode)
      .build();

    this.subscription = this.query.events.subscribe();
  }

  /** @internal */
  private add(parents: Storage<Parent>, nodes: Storage<UiNode>, entity: Entity): void {
    const component = nodes.get(entity);

    if (parents.has(entity)) {
      const parent = parents.get(entity).entity;

      nodes
        .get(parent)
        .container
        .addChild(component.container);
    }
    else {
      this.stage.add(component.container, component.layer);
    }
  }

  /** @internal */
  private remove(roots: Storage<UiNode>, entity: Entity): void {
    const root = roots.get(entity);

    root.container.parent?.removeChild(root.container);
  }

  /** @inheritDoc */
  public update(world: World): void {
    const nodes = world.storage(UiNode);
    const parents = world.storage(Parent);

    for (const event of this.query.events.read(this.subscription)) {
      switch (event.type) {
        case QueryEventType.Added:
          this.add(parents, nodes, event.entity);
          break;
        case QueryEventType.Removed:
          this.remove(nodes, event.entity);
          break;
      }
    }
  }

}
