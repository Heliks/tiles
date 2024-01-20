import {
  Entity,
  Hierarchy,
  Injectable,
  InjectStorage,
  Parent,
  ProcessingSystem,
  Query,
  QueryBuilder,
  Storage,
  Subscriber,
  World
} from '@heliks/tiles-engine';
import { Display } from '../layout';
import { canReceiveEvents } from '../lifecycle';
import { UiEvent } from '../ui-event';
import { UiNode } from '../ui-node';


/**
 * Updates {@link Element elements} on active {@link UiNode nodes}.
 *
 * Updates happens top-down in a nodes entity {@link Hierarchy}, which means that
 * parent nodes are always updated before their children.
 */
@Injectable()
export class UpdateElements extends ProcessingSystem {

  /** Contains active subscriptions for nodes that are interactive. */
  private subscriptions = new Map<UiNode, Subscriber<UiEvent>>();

  /**
   * @param nodes Storage for {@link UiNode} components.
   * @param hierarchy Entity hierarchy.
   */
  constructor(
    @InjectStorage(UiNode)
    private readonly nodes: Storage<UiNode>,
    private readonly hierarchy: Hierarchy
  ) {
    super();
  }

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query
      .contains(UiNode)
      .excludes(Parent)
      .build();
  }

  public setupNodeSubscription(node: UiNode): Subscriber<UiEvent> {
    const subscriber = node.onInteract.subscribe();

    this.subscriptions.set(node, subscriber);

    return subscriber;
  }

  /**
   * Returns the {@link Subscriber} for interaction events of the given `node`. If none
   * exists, it will be created.
   *
   * This function should be called with caution, as any new event queue *must* consume
   * its events, or it will grow indefinitely, causing memory leaks.
   */
  public getNodeSubscription(node: UiNode): Subscriber<UiEvent> {
    const subscriber = this.subscriptions.get(node);

    return subscriber
      ? subscriber
      : this.setupNodeSubscription(node);
  }

  public handleElementEventLifecycle(world: World, node: UiNode): void {
    // Safety: This function should only be called with nodes that have an element.
    const viewRef = node._element!.getViewRef();

    if (canReceiveEvents(viewRef)) {
      const subscriber = this.getNodeSubscription(node);

      for (const event of subscriber.read()) {
        viewRef.onEvent(world, event);
      }
    }
  }

  public updateNode(world: World, entity: Entity): void {
    const node = this.nodes.get(entity);
    const show = node.style.display !== Display.None;

    node.container.visible = show;

    // Exit early if the node is hidden. Children don't need to be updated.
    if (! show) {
      return;
    }

    if (node._element) {
      this.handleElementEventLifecycle(world, node);

      node._element.update(world, entity, node.layout);

      // Widgets can project their content size directly onto the layout node,
      // overwriting the existing style.
      if (node._element.size) {
        node.layout.style.size = node._element.size;
      }
    }

    const children = this.hierarchy.children.get(entity);

    if (children) {
      for (const child of children) {
        this.updateNode(world, child);
      }
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    for (const entity of this.query.entities) {
      this.updateNode(world, entity);
    }
  }

}

