import { App, Parent, runtime, Subscriber, TransformBundle, World } from '@heliks/tiles-engine';
import { Element } from '../../element';
import { OnEvent } from '../../lifecycle';
import { UiEvent } from '../../ui-event';
import { UiNode, UiNodeInteraction } from '../../ui-node';
import { UpdateElements } from '../update-elements';


class NoopElement implements Element {

  /** @inheritDoc */
  update = jest.fn();

  /** @inheritDoc */
  public getViewRef(): this {
    return this;
  }

}

describe('UpdateElements', () => {
  let app: App;
  let system: UpdateElements;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .component(UiNode)
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

  it('should update node element', () => {
    const element = new NoopElement();
    const entity = world.insert(new UiNode().setElement(element));

    system.updateNode(world, entity);

    expect(element.update).toHaveBeenCalled();
  });

  it('should update nodes hierarchically', () => {
    const entity1 = world.insert(new UiNode());
    const entity2 = world.insert(new UiNode());
    const entity3 = world.insert(new UiNode());

    // Create a hierarchy that is different from the order in which entities were
    // created. This ensures that the test doesn't report a false positive where
    // entities are merely conveniently located next to each other in their group.
    world.attach(entity2, new Parent(entity1));
    world.attach(entity1, new Parent(entity3));

    const onUpdateNode = jest.spyOn(system, 'updateNode');

    app.update();

    expect(onUpdateNode).toHaveBeenNthCalledWith(1, world, entity3);
    expect(onUpdateNode).toHaveBeenNthCalledWith(2, world, entity1);
    expect(onUpdateNode).toHaveBeenNthCalledWith(3, world, entity2);
  });

  describe('when handling the event lifecycle', () => {
    it('should call OnEvent lifecycle', () => {
      class Foo extends NoopElement implements OnEvent {
        onEvent = jest.fn();
      }

      const element = new Foo();
      const node = new UiNode();

      node.setElement(element);
      node.interactive = true;

      const entity = world.insert(node);

      // The system can only receive UiEvents that occur after it has initialized the
      // subscription for the interaction event queue.
      system.setupNodeSubscription(node);

      const event = new UiEvent(entity, UiNodeInteraction.Down);

      node.onInteract.push(event);

      // Execute the lifecycle event.
      system.handleElementEventLifecycle(world, node);

      expect(element.onEvent).toHaveBeenCalledWith(world, event);
    });
  });

  describe('when a node subscriber is request', () => {
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