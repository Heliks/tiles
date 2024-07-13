import { Entity, Subscriber, World } from '@heliks/tiles-engine';
import { Element } from '../element';
import { canReceiveEvents } from '../lifecycle';
import { UiEvent } from '../ui-event';
import { UiNode } from '../ui-node';


/**
 * Service that manages active subscriptions for {@link UiElement elements} that want to
 * use the {@link OnEvent} lifecycle hook.
 */
export class EventLifecycle {

  private readonly interactions = new Map<UiNode, Subscriber<UiEvent>>();

  public setup(node: UiNode): Subscriber<UiEvent> {
    const subscriber = node.onInteract.subscribe();

    this.interactions.set(node, subscriber);

    return subscriber;
  }

  /**
   * Returns the {@link Subscriber} for interaction events of the given `node`. If none
   * exists, it will be created.
   *
   * This function should be called with caution, as any new event queue *must* consume
   * its events, or it will grow indefinitely, causing memory leaks.
   */
  public subscriber(node: UiNode): Subscriber<UiEvent> {
    const subscriber = this.interactions.get(node);

    return subscriber
      ? subscriber
      : this.setup(node);
  }

  /** Unsubscribes the element that is owned by the given `node` from the OnEvent lifecycle. */
  public unsubscribe(node: UiNode): void {
    const subscriber = this.interactions.get(node);

    if (subscriber) {
      node.onInteract.unsubscribe(subscriber);
    }
  }

  public trigger(world: World, owner: Entity, node: UiNode, element: Element): void {
    const viewRef = element.getContext();

    if (canReceiveEvents(viewRef)) {
      const subscriber = this.subscriber(node);

      for (const event of subscriber.read()) {
        viewRef.onEvent(world, event, owner);
      }
    }
  }

}
