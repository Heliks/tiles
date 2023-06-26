import {
  Entity,
  InjectStorage,
  OnInit,
  Parent,
  Query,
  QueryEventType,
  Storage,
  Subscriber,
  System,
  World
} from '@heliks/tiles-engine';
import { Stage } from '@heliks/tiles-pixi';
import { Injectable } from '@heliks/tiles-engine';
import { UiNode } from './ui-node';


@Injectable()
export class SyncNodes implements OnInit, System {

  /** @internal */
  private query!: Query;

  /** @internal */
  private subscription!: Subscriber;

  /**
   * @param parents Storage for {@link Parent} components.
   * @param uiNodes Storage for {@link UiNode} components.
   * @param stage Renderer stage.
   */
  constructor(
    @InjectStorage(Parent)
    private parents: Storage<Parent>,
    @InjectStorage(UiNode)
    private uiNodes: Storage<UiNode>,
    private readonly stage: Stage
  ) {}

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
