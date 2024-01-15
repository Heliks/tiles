import {
  Entity,
  Injectable,
  InjectStorage,
  OnInit,
  Parent,
  Query,
  QueryEvent,
  QueryEventType,
  Storage,
  Subscriber,
  System,
  World
} from '@heliks/tiles-engine';
import { Stage } from '@heliks/tiles-pixi';
import { canDestroy, canInit } from '../lifecycle';
import { UiNode } from '../ui-node';


@Injectable()
export class SyncNodes implements OnInit, System {

  /** @internal */
  private query!: Query;

  /** @internal */
  private subscription!: Subscriber<QueryEvent>;

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
  private add(world: World, parents: Storage<Parent>, nodes: Storage<UiNode>, entity: Entity): void {
    const component = nodes.get(entity);

    if (parents.has(entity)) {
      const parent = parents.get(entity).entity;

      nodes
        .get(parent)
        .container
        .addChild(component.container);
    }
    else {
      this.stage.add(component.container, component.style.layer);
    }

    if (canInit(component._element)) {
      component._element.onInit(world, entity);
    }
  }

  /** @internal */
  private remove(world: World, roots: Storage<UiNode>, entity: Entity): void {
    const root = roots.get(entity);

    root.container.parent?.removeChild(root.container);

    if (canDestroy(root._element)) {
      root._element.onDestroy(world, entity);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    const nodes = world.storage(UiNode);
    const parents = world.storage(Parent);

    for (const event of this.subscription.read()) {
      switch (event.type) {
        case QueryEventType.Added:
          this.add(world, parents, nodes, event.entity);
          break;
        case QueryEventType.Removed:
          this.remove(world, nodes, event.entity);
          break;
      }
    }
  }

}
