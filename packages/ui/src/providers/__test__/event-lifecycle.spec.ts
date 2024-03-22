import { App, runtime, Subscriber, World } from '@heliks/tiles-engine';
import { NoopElement } from '../../__test__/utils/noop-element';
import { OnEvent } from '../../lifecycle';
import { UiElement } from '../../ui-element';
import { UiEvent } from '../../ui-event';
import { UiNode, UiNodeInteraction } from '../../ui-node';
import { EventLifecycle } from '../event-lifecycle';


describe('EventLifecycle', () => {
  let app: App;
  let service: EventLifecycle;
  let world: World;

  beforeEach(() => {
    app = runtime().provide(EventLifecycle).build();

    service = app.world.get(EventLifecycle);
    world = app.world;
  });

  describe('when triggering the event lifecycle', () => {
    it('should call OnEvent callback on element when node is being interacted with', () => {
      class Foo extends NoopElement implements OnEvent {
        onEvent = jest.fn();
      }

      const element = new UiElement(new Foo());
      const node = new UiNode();

      node.interactive = true;

      const entity = world.insert(node, element);

      // The system can only receive UiEvents that occur after it has initialized the
      // subscription for the interaction event queue.
      service.setup(node);

      const event = new UiEvent(entity, UiNodeInteraction.Down);

      node.onInteract.push(event);

      // Execute the lifecycle event.
      service.trigger(world, node, element.instance);

      expect(element.instance.onEvent).toHaveBeenCalledWith(world, event);
    });
  });

  describe('when a subscriber is requested', () => {
    it('should return a subscriber', () => {
      const subscriber = service.subscriber(new UiNode());

      expect(subscriber).toBeInstanceOf(Subscriber)
    });

    it('should re-use existing subscriber', () => {
      const node = new UiNode();

      const subscriber1 = service.subscriber(node);
      const subscriber2 = service.subscriber(node);

      expect(subscriber1).toBe(subscriber2);
    });
  });

  it('should unsubscribe lifecycle subscriber from the nodes event queue', () => {
    const node = new UiNode();
    const subscriber = service.subscriber(node);

    node.onInteract.unsubscribe = jest.fn();

    service.unsubscribe(node);

    expect(node.onInteract.unsubscribe).toHaveBeenCalledWith(subscriber);
  });
});
