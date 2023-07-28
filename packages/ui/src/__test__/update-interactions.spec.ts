import { UpdateInteractions } from '../update-interactions';
import { Entity, runtime, World } from '@heliks/tiles-engine';
import { UiNode } from '../ui-node';
import { Parent } from '@heliks/tiles-engine';
import { Interaction, InteractionEvent } from '../interaction-event';


describe('UpdateInteractions', () => {
  let system: UpdateInteractions;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .component(UiNode)
      .component(Parent)
      .system(UpdateInteractions)
      .build()
      .world;

    system = world.get(UpdateInteractions);

    // Fixme: https://trello.com/c/JZxxJwm9/82
    system.boot(world);
  });

  describe('on update', () => {
    let entity: Entity;
    let node: UiNode;

    beforeEach(() => {
      node = new UiNode();
      node.interactive = true;

      entity = world.create(node);

      world.update();
    });

    describe('pointer down interactions', () => {
      it('should be triggered', () => {
        system.down(entity).update();

        expect(node.interaction).toBe(Interaction.Down);
      });

      it('should fire an event', () => {
        const subscriber = node.onInteract.subscribe();

        system.down(entity).update();

        const event = node.onInteract.next(subscriber);

        expect(event).toMatchObject(new InteractionEvent(entity, Interaction.Down));
      });
    });

    describe('pointer up interactions', () => {
      beforeEach(() => {
        // Node needs to be pressed before it can be released.
        system.down(entity).update();
      });

      it('should be triggered', () => {
        system.up(entity).update();

        expect(node.interaction).toBe(Interaction.Up);
      });

      it('should fire an event', () => {
        const subscriber = node.onInteract.subscribe();

        system.up(entity).update();

        const event = node.onInteract.next(subscriber);

        expect(event).toMatchObject(new InteractionEvent(entity, Interaction.Up));
      });
    });

    it('should bubble events', () => {
      const nodeB = new UiNode();

      // Define hierarchy: parentA > parentB > Node
      const parentA = world.create(new UiNode());
      const parentB = world.create(nodeB, new Parent(parentA));

      world.add(entity, new Parent(parentB));

      // Subscribe to queue of the highest node in the hierarchy.
      const subscriber = nodeB.onInteract.subscribe();

      system
        .down(entity)
        .update();

      // Fetch event that is supposed to be bubble up the chain.
      const event = nodeB.onInteract.next(subscriber);

      expect(event).toMatchObject(new InteractionEvent(entity, Interaction.Down));
    });
  });

});
