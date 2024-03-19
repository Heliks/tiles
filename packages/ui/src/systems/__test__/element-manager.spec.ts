import { App, Parent, runtime, World } from '@heliks/tiles-engine';
import { Sprite, Texture } from 'pixi.js';
import { NoopAttribute } from '../../__test__/utils/noop-attribute';
import { NoopElement } from '../../__test__/utils/noop-element';
import { SpawnOnInit } from '../../__test__/utils/spawn-on-init';
import { SpawnOnUpdate } from '../../__test__/utils/spawn-on-update';
import { Host } from '../../context';
import { OnBeforeInit, OnDestroy, OnInit } from '../../lifecycle';
import { Document } from '../../providers/document';
import { EventLifecycle } from '../../providers/event-lifecycle';
import { UiElement } from '../../ui-element';
import { UiNode } from '../../ui-node';
import { ElementManager, setupHostContext } from '../element-manager';


describe('setupHostContext', () => {
  let world: World;

  beforeEach(() => {
    world = runtime().build().world;
  });

  it('should assign host entity', () => {
    const element = new UiElement(new NoopElement());

    const entity1 = world.insert(new UiElement(new NoopElement()), new Host());
    const entity2 = world.insert(new UiElement(new NoopElement()), new Parent(entity1));
    const entity3 = world.insert(element, new Parent(entity2));

    // Element context references are not set up yet, therefore, when the setup tries
    // to share data, it would cause an error.
    element.share = jest.fn();

    setupHostContext(world, entity3);

    expect(element.host).toBe(entity1);
  });

  it('should share data with host after it was assigned', () => {
    const element1 = new UiElement(new NoopElement());
    const element2 = new UiElement(new NoopElement());

    const entity1 = world.insert(element1, new Host());
    const entity2 = world.insert(element2, new Parent(entity1));

    element2.share = jest.fn();

    setupHostContext(world, entity2);

    expect(element2.share).toHaveBeenCalledWith(element1);
  });
});

describe('ElementManager', () => {
  let app: App;
  let system: ElementManager;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .component(UiElement)
      .component(UiNode)
      .provide(EventLifecycle)
      .provide(Document)
      .system(ElementManager)
      .build();

    // Boot system.
    app.start({
      update: jest.fn()
    });

    system = app.world.get(ElementManager);
    world = app.world;
  });

  describe('emitOnInit()', () => {
    it('should call OnInit lifecycle on element instance', () => {
      class OnInitElement extends NoopElement implements OnInit {
        onInit = jest.fn();
      }

      const element = new UiElement(new OnInitElement());
      const entity = world.insert(element);

      system.emitOnInit(world, entity, element);

      const onInit = element.instance.onInit;

      expect(onInit).toHaveBeenCalledWith(world, entity);
    });

    it('should call OnInit lifecycle on attributes', () => {
      class OnInitAttribute extends NoopAttribute implements OnInit {
        onInit = jest.fn();
      }

      const attribute = new OnInitAttribute();
      const element = new UiElement(new NoopElement());
      const entity = world.insert(element);

      element.attr('foo', attribute);

      system.emitOnInit(world, entity, element);

      expect(attribute.onInit).toHaveBeenCalledWith(world, entity);
    });
  });

  describe('emitOnBeforeInit()', () => {
    it('should call OnBeforeInit lifecycle on element instance', () => {
      class OnBeforeInitElement extends NoopElement implements OnBeforeInit {
        onBeforeInit = jest.fn();
      }

      const element = new UiElement(new OnBeforeInitElement());
      const entity = world.insert(element);

      system.emitOnBeforeInit(world, entity, element);

      const onBeforeInit = element.instance.onBeforeInit;

      expect(onBeforeInit).toHaveBeenCalledWith(world, entity);
    });

    it('should call OnBeforeInit lifecycle on attributes', () => {
      class OnBeforeInitAttribute extends NoopAttribute implements OnBeforeInit {
        onBeforeInit = jest.fn();
      }

      const element = new UiElement(new NoopElement());
      const attribute = new OnBeforeInitAttribute();

      const entity = world.insert(element);

      element.attr('foo', attribute);

      system.emitOnBeforeInit(world, entity, element);

      expect(attribute.onBeforeInit).toHaveBeenCalledWith(world, entity);
    });
  });

  describe('emitOnDestroy()', () => {
    it('should call OnDestroy lifecycle on element instance', () => {
      class OnDestroyElement extends NoopElement implements OnDestroy {
        onDestroy = jest.fn();
      }

      const element = new UiElement(new OnDestroyElement());
      const entity = world.insert(element);

      system.emitOnDestroy(world, entity, element);

      const onDestroy = element.instance.onDestroy;

      expect(onDestroy).toHaveBeenCalledWith(world, entity);
    });

    it('should call OnDestroy lifecycle on attributes', () => {
      class OnDestroyAttribute extends NoopAttribute implements OnDestroy {
        onDestroy = jest.fn();
      }

      const element = new UiElement(new NoopElement());
      const attribute = new OnDestroyAttribute();
      const entity = world.insert(element);

      element.attr('foo', attribute);

      system.emitOnDestroy(world, entity, element);

      expect(attribute.onDestroy).toHaveBeenCalledWith(world, entity);
    });
  });

  describe('onEntityAdded()', () => {
    it('should initialize the elements ContextRef', () => {
      // Test context.
      const context = {};
      const element = new UiElement({
        update: () => null,
        getContext: () => context
      });

      // Add an entity with the created element to the system.
      system.onEntityAdded(world, world.insert(new UiNode(), element));

      expect(element.context.context).toBe(context);
    });

    it('should insert element view as first child into node container', () => {
      const view = new Sprite(Texture.WHITE);
      const node = new UiNode();

      // Insert some test sprites into the node container to make sure that the element
      // view is always added as the containers first child.
      node.container.addChild(
        new Sprite(Texture.WHITE),
        new Sprite(Texture.WHITE),
        new Sprite(Texture.WHITE)
      );

      // Create the entity & add it to the system.
      system.onEntityAdded(world, world.insert(
        node,
        new UiElement({
          update: () => null,
          getContext: () => ({}),
          view
        })
      ));

      const first = node.container.children[0];

      expect(first).toBe(view);
    });
  });

  describe('onEntityRemoved()', () => {
    it('should remove element view from node container', () => {
      const view = new Sprite();
      const node = new UiNode();

      const entity = world.insert(
        node,
        new UiElement({
          update: () => null,
          getContext: () => ({}),
          view
        })
      );

      // Manually add view to node container.
      node.container.addChild(view);

      system.onEntityRemoved(world, entity);

      expect(node.container.children).toHaveLength(0);
    });

    it('should emit destroy events', () => {
      const element = new UiElement(new NoopElement());
      const entity = world.insert(new UiNode(), element);

      system.emitOnDestroy = jest.fn();
      system.onEntityRemoved(world, entity);

      expect(system.emitOnDestroy).toHaveBeenCalledWith(world, entity, element);
    })
  });

  describe('update()', () => {
    it.each([
      {
        description: 'spawned by OnInit lifecycle',
        spawner: SpawnOnInit
      },
      {
        description: 'spawned by update() call',
        spawner: SpawnOnUpdate
      }
    ])('should call onEntityAdded() for element that is $description', data => {
      const element3 = new UiElement(new NoopElement());
      const element2 = new UiElement(new data.spawner(element3));
      const element1 = new UiElement(new data.spawner(element2));

      jest.spyOn(system, 'onEntityAdded');

      world.insert(new UiNode(), element1);
      world.update();

      system.update(world);

      const store = world.storage(UiElement);

      // All previously created entities should have an owner now.
      const owner1 = store.owner(element1);
      const owner2 = store.owner(element2);
      const owner3 = store.owner(element3);

      expect(system.onEntityAdded).toHaveBeenCalledWith(world, owner1);
      expect(system.onEntityAdded).toHaveBeenCalledWith(world, owner2);
      expect(system.onEntityAdded).toHaveBeenCalledWith(world, owner3);
    });
  });
});
