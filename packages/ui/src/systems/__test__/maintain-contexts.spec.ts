import { App, Parent, runtime, World } from '@heliks/tiles-engine';
import { Context } from '../../context/context';
import { Element } from '../../element';
import { Input, Output } from '../../params';
import { UiNode } from '../../ui-node';
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
    class NoopElement implements Element {

      public foo = false;
      public bar = false;

      /** @inheritDoc */
      update = jest.fn();

      /** @inheritDoc */
      public getViewRef(): this {
        return this;
      }

    }

    it('should set parent context', () => {
      const context = new Context();
      const entity1 = world.insert(new UiNode().setElement(new NoopElement()), new Context());

      // This entity makes sure we resolve the parent context through parents that
      // do not capture it.
      const entity2 = world.insert(new UiNode().setElement(new NoopElement()), new Parent(entity1));
      const entity3 = world.insert(new UiNode().setElement(new NoopElement()), new Parent(entity2), context);

      system.insert(world, entity3);

      expect(context.parent).toBe(entity1);
    });

    it('should add child context to parent', () => {
      const context = new Context();
      const entity1 = world.insert(new UiNode().setElement(new NoopElement()), context);
      const entity2 = world.insert(new UiNode().setElement(new NoopElement()), new Context(), new Parent(entity1));

      system.insert(world, entity2);

      const isChild = context.children.has(entity2);

      expect(isChild).toBeTruthy();
    });

    it('should set inputs', () => {
      class Noop implements Element {
        @Input()
        public foo = true;
        public bar = true;

        /** @inheritDoc */
        public update = jest.fn();

        /** @inheritDoc */
        public getViewRef(): this {
          return this;
        }
      }

      const context = new Context();
      const entity = world.insert(UiNode.use(new Noop()), context);

      system.insert(world, entity);

      const inputs = Array.from(context.inputs);

      expect(inputs).toEqual([ 'foo' ]);
    });

    it('should set outputs', () => {
      class Noop implements Element {
        @Output()
        public foo = true;
        public bar = true;

        /** @inheritDoc */
        public update = jest.fn();

        /** @inheritDoc */
        public getViewRef(): this {
          return this;
        }
      }

      const context = new Context();
      const entity = world.insert(UiNode.use(new Noop()), context);

      system.insert(world, entity);

      const outputs = Array.from(context.outputs);

      expect(outputs).toEqual([ 'foo' ]);
    });
  });

  it('should detach a child context from its parent', () => {
    class NoopElement implements Element {

      /** @inheritDoc */
      update = jest.fn();

      /** @inheritDoc */
      public getViewRef(): this {
        return this;
      }

    }

    const context = new Context();
    const entity1 = world.insert(new UiNode().setElement(new NoopElement()), context);
    const entity2 = world.insert(new UiNode().setElement(new NoopElement()), new Context(), new Parent(entity1));

    system.insert(world, entity1);
    system.insert(world, entity2);

    // Remove entity
    system.remove(world, entity2);

    const hasChild = context.children.has(entity2);

    expect(hasChild).toBeFalsy();
  });

});