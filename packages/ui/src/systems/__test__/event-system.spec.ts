import { Entity, Parent, runtime, World } from '@heliks/tiles-engine';
import { UiEvent } from '../../ui-event';
import { UiNode, UiNodeInteraction } from '../../ui-node';
import { EventSystem } from '../event-system';


describe('EventSystem', () => {
  let system: EventSystem;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .component(UiNode)
      .component(Parent)
      .system(EventSystem)
      .build()
      .world;

    system = world.get(EventSystem);

    // Fixme: https://trello.com/c/JZxxJwm9/82
    system.boot(world);
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

    describe('pointer down interactions', () => {
      it('should be triggered', () => {
        system.down(entity).update();

        expect(node.interaction).toBe(UiNodeInteraction.Down);
      });

      it('should fire an event', () => {
        const subscriber = node.onInteract.subscribe();

        system.down(entity).update();

        const event = subscriber.next();

        expect(event).toMatchObject(new UiEvent(entity, UiNodeInteraction.Down));
      });
    });

    describe('pointer up interactions', () => {
      beforeEach(() => {
        // Node needs to be pressed before it can be released.
        system.down(entity).update();
      });

      it('should be triggered', () => {
        system.up(entity).update();

        expect(node.interaction).toBe(UiNodeInteraction.Up);
      });

      it('should fire an event', () => {
        const subscriber = node.onInteract.subscribe();

        system.up(entity).update();

        const event = subscriber.next();

        expect(event).toMatchObject(new UiEvent(entity, UiNodeInteraction.Up));
      });
    });

    it('should bubble events', () => {
      const nodeB = new UiNode();

      // Define hierarchy: parentA > parentB > Node
      const parentA = world.insert(new UiNode());
      const parentB = world.insert(nodeB, new Parent(parentA));

      world.add(entity, new Parent(parentB));

      // Subscribe to queue of the highest node in the hierarchy.
      const subscriber = nodeB.onInteract.subscribe();

      system
        .down(entity)
        .update();

      // Fetch event that is supposed to be bubble up the chain.
      const event = subscriber.next();

      expect(event).toMatchObject(new UiEvent(entity, UiNodeInteraction.Down));
    });
  });
});
