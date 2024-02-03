import { Injectable, ProcessingSystem, Query, QueryBuilder, Subscriber, World } from '@heliks/tiles-engine';
import { ContextRef } from '../context';
import { Element } from '../element';
import { canReceiveEvents } from '../lifecycle';
import { UiElement } from '../ui-element';
import { UiEvent } from '../ui-event';
import { UiNode } from '../ui-node';


/**
 * Updates elements.
 */
@Injectable()
export class UpdateElements extends ProcessingSystem {

  /** Contains active subscriptions for nodes that are interactive. */
  private subscriptions = new Map<UiNode, Subscriber<UiEvent>>();

  /** @inheritDoc */
  public build(query: QueryBuilder): Query {
    return query
      .contains(UiNode)
      .contains(UiElement)
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

  public handleElementEventLifecycle(world: World, node: UiNode, element: Element): void {
    const viewRef = element.getContext();

    if (canReceiveEvents(viewRef)) {
      const subscriber = this.getNodeSubscription(node);

      for (const event of subscriber.read()) {
        viewRef.onEvent(world, event);
      }
    }
  }

  private updateAttributes(node: UiNode, element: UiElement, context: ContextRef): void {
    for (const item of element.attributes) {
      item.resolve(context);
      item.attribute.update(node);
    }
  }

  /** @inheritDoc */
  public update(world: World): void {
    const elements = world.storage(UiElement);
    const nodes = world.storage(UiNode);

    for (const entity of this.query.entities) {
      const element = elements.get(entity);
      const node = nodes.get(entity);

      // Note: Data is shared with the context host and attributes are evaluated even if
      // the node is invisible, because when an attribute receives a new input, it could
      // possibly make the element visible again.
      if (element.host !== undefined) {
        const host = elements.get(element.host);

        this.updateAttributes(node, element, host.context);

        element.share(host);
      }

      if (node.hidden()) {
        continue;
      }

      this.handleElementEventLifecycle(world, node, element.instance);

      element.instance.update(world, entity, node.layout);

      // Elements can project their content size directly into the stylesheet.
      if (element.instance.size) {
        node.layout.style.size = element.instance.size;
      }
    }
  }

}

