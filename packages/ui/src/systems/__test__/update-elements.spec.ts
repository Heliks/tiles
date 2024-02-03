import { App, Parent, runtime, Subscriber, TransformBundle, World } from '@heliks/tiles-engine';
import { OnEvent } from '../../lifecycle';
import { UiElement } from '../../ui-element';
import { UiEvent } from '../../ui-event';
import { UiNode, UiNodeInteraction } from '../../ui-node';
import { UpdateElements } from '../update-elements';
import { NoopElement } from './utils';


describe('UpdateElements', () => {
  let app: App;
  let system: UpdateElements;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .component(UiNode)
      .component(UiElement)
      .component(Parent)
      .bundle(new TransformBundle())
      .system(UpdateElements)
      .build();

    // Boot system.
    app.start({
      update: jest.fn()
    });

    system = app.world.get(UpdateElements);
    world = app.world;
  });


  describe('when handling the event lifecycle', () => {
    it('should call OnEvent lifecycle', () => {
      class Foo extends NoopElement implements OnEvent {
        onEvent = jest.fn();
      }

      const element = new UiElement(new Foo());
      const node = new UiNode();

      node.interactive = true;

      const entity = world.insert(node, element);

      // The system can only receive UiEvents that occur after it has initialized the
      // subscription for the interaction event queue.
      system.setupNodeSubscription(node);

      const event = new UiEvent(entity, UiNodeInteraction.Down);

      node.onInteract.push(event);

      // Execute the lifecycle event.
      system.handleElementEventLifecycle(world, node, element.instance);

      expect(element.instance.onEvent).toHaveBeenCalledWith(world, event);
    });
  });

  describe('when a subscriber is requested', () => {
    it('should return a subscriber', () => {
      const subscriber = system.getNodeSubscription(new UiNode());

      expect(subscriber).toBeInstanceOf(Subscriber)
    });

    it('should re-use existing subscriber', () => {
      const node = new UiNode();

      const subscriber1 = system.getNodeSubscription(node);
      const subscriber2 = system.getNodeSubscription(node);

      expect(subscriber1).toBe(subscriber2);
    });
  });
});