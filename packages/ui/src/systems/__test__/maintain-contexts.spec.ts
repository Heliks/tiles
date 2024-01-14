import { App, Parent, runtime, World } from '@heliks/tiles-engine';
import { Context } from '../../context';
import { Input } from '../../params';
import { UiNode } from '../../ui-node';
import { UiWidget } from '../../ui-widget';
import { MaintainContexts } from '../maintain-contexts';


describe('MaintainContexts', () => {
  let app: App;
  let system: MaintainContexts;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .system(MaintainContexts)
      .build();

    // Boot system.
    app.start({
      update: jest.fn()
    });

    system = app.world.get(MaintainContexts);
    world = app.world;
  });

  describe('when inserting an entity in the context hierarchy', () => {
    class NoopElement implements UiWidget {

      @Input()
      public foo = false;

      @Input()
      public bar = false;

      /** @inheritDoc */
      update = jest.fn();

      /** @inheritDoc */
      public getContextInstance(): this {
        return this;
      }

    }

    it('should set parent context', () => {
      const context = new Context();
      const entity1 = world.insert(new UiNode().setWidget(new NoopElement()), new Context());

      // This entity makes sure we resolve the parent context through parents that
      // do not capture it.
      const entity2 = world.insert(new UiNode().setWidget(new NoopElement()), new Parent(entity1));
      const entity3 = world.insert(new UiNode().setWidget(new NoopElement()), new Parent(entity2), context);

      system.onEntityAdded(world, entity3);

      expect(context.parent).toBe(entity1);
    });

    it('should add child context to parent', () => {
      const context = new Context();
      const entity1 = world.insert(new UiNode().setWidget(new NoopElement()), context);
      const entity2 = world.insert(new UiNode().setWidget(new NoopElement()), new Context(), new Parent(entity1));

      system.onEntityAdded(world, entity2);

      const isChild = context.children.has(entity2);

      expect(isChild).toBeTruthy();
    });

    it('should set inputs', () => {
      const context = new Context();
      const entity = world.insert(new UiNode().setWidget(new NoopElement()), context);

      system.onEntityAdded(world, entity);

      const inputs = Array.from(context.inputs).sort();

      expect(inputs).toEqual([
        'foo',
        'bar'
      ].sort());
    });
  });

  it('should detach a child context from its parent', () => {
    class NoopElement implements UiWidget {

      /** @inheritDoc */
      update = jest.fn();

      /** @inheritDoc */
      public getContextInstance(): this {
        return this;
      }

    }

    const context = new Context();
    const entity1 = world.insert(new UiNode().setWidget(new NoopElement()), context);
    const entity2 = world.insert(new UiNode().setWidget(new NoopElement()), new Context(), new Parent(entity1));

    system.onEntityAdded(world, entity1);
    system.onEntityAdded(world, entity2);

    // Remove entity
    system.remove(world, entity2);

    const hasChild = context.children.has(entity2);

    expect(hasChild).toBeFalsy();
  });

});