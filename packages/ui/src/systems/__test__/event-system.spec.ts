import { Entity, Parent, runtime, Ticker, World } from '@heliks/tiles-engine';
import { NoopElement } from '../../__test__/utils/noop-element';
import { UiElement } from '../../ui-element';
import { UiEvent } from '../../ui-event';
import { UiFocus } from '../../ui-focus';
import { UiNode, UiNodeInteraction } from '../../ui-node';
import { EventSystem } from '../event-system';


describe('EventSystem', () => {
  let system: EventSystem;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .component(UiNode)
      .component(Parent)
      .provide(UiFocus)
      .system(EventSystem)
      .build()
      .world;

    system = world.get(EventSystem);

    // Fixme: https://trello.com/c/JZxxJwm9/82
    system.boot(world);
    system.longPressTimeMs = 1000;
  });

  describe('on update', () => {
    let entity: Entity;
    let node: UiNode;

    beforeEach(() => {
      node = new UiNode();
      node.interactive = true;

      entity = world.insert(node);

      world.update();
    });

    it('should bubble events', () => {
      const node = new UiNode();

      // Define hierarchy: parentA > parentB > Node
      const parentA = world.insert(new UiNode());
      const parentB = world.insert(node, new Parent(parentA));

      world.attach(entity, new Parent(parentB));

      // Subscribe to queue of the highest node in the hierarchy.
      const subscriber = node.onInteract.subscribe();

      system
        .down(entity)
        .update(world);

      // Fetch event that is supposed to be bubble up the chain.
      const event = subscriber.next();

      expect(event).toMatchObject(new UiEvent(entity, UiNodeInteraction.Down));
    });
  });

  describe('updateLongPress()', () => {
    let origin: Entity;
    let ticker: Ticker;

    beforeEach(() => {
      ticker = world.get(Ticker);
      origin = world.insert(
        new UiNode(),
        new UiElement(new NoopElement())
      );
    });

    it('should update the active long-press timer', () => {
      system.longPress = { origin, timer: 0 };
      ticker.delta = 500;

      system.updateLongPress();

      expect(system.longPress.timer).toBe(500);
    });

    it('should trigger long-press UiEvent when timer is exceeded', () => {
      system.pushInteractionEvent = jest.fn();

      system.longPressTimeMs = 1000;
      system.longPress = { origin, timer: 0 };

      ticker.delta = 1000;

      system.updateLongPress();

      const node = world.storage(UiNode).get(origin);
      const event = new UiEvent(origin, UiNodeInteraction.LongPress);

      expect(system.pushInteractionEvent).toHaveBeenCalledWith(origin, node, event);
      expect(system.longPress).toBeUndefined();
    });
  });

  describe('consumeQueuedInteraction()', () => {
    let origin: Entity;

    beforeEach(() => {
      origin = world.insert(
        new UiNode(),
        new UiElement(new NoopElement())
      );
    });

    it('should start a long-press timer when a DOWN event is consumed', () => {
      system.down(origin);
      system.consumeQueuedInteraction(origin);

      expect(system.longPress).toMatchObject({
        origin,
        timer: 0
      });
    });

    it('should cancel any active long-press timer when an UP event is consumed', () => {
      system.longPress = {
        origin,
        timer: 0
      };

      system.up(origin);
      system.consumeQueuedInteraction(origin);

      expect(system.longPress).toBeUndefined();
    });
  });
});
