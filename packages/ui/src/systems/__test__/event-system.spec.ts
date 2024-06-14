import { Entity, Parent, runtime, World } from '@heliks/tiles-engine';
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
});
