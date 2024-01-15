import { runtime, World } from '@heliks/tiles-engine';
import { Context } from '../../context';
import { Element } from '../../element';
import { UiNode } from '../../ui-node';
import { UpdateContexts } from '../update-contexts';


describe('UpdateContexts', () => {
  let system: UpdateContexts;
  let world: World;

  beforeEach(() => {
    world = runtime()
      .component(Context)
      .component(UiNode)
      .system(UpdateContexts)
      .build()
      .world;

    system = world.get(UpdateContexts);
  });

  describe('when updating an entity tree', () => {
    it('it should propagate data to child elements within the parents context', () => {
      class NoopElement implements Element {

        public step1 = false;
        public step2 = false;
        public step3 = false;

        /** @inheritDoc */
        update = jest.fn();

        /** @inheritDoc */
        public getContextInstance(): this {
          return this;
        }

      }

      const element1 = new NoopElement();
      const element2 = new NoopElement();
      const element3 = new NoopElement();

      type Step1 = { step1: boolean };
      type Step2 = { step2: boolean };
      type Step3 = { step3: boolean };

      // Contexts will propagate a boolean flag from element1.step1 to element3.step3.
      const ctx1 = new Context<Step1>();
      const ctx2 = new Context<Step2, Step1>().input('step2').bind('step2', 'step1');
      const ctx3 = new Context<Step3, Step2>().input('step3').bind('step3', 'step2');

      // Set initial data on element.
      element1.step1 = true;

      const entity1 = world.insert(new UiNode().setElement(element1), ctx1);
      const entity2 = world.insert(new UiNode().setElement(element2), ctx2);
      const entity3 = world.insert(new UiNode().setElement(element3), ctx3);

      // Build context hierarchy Context1 -> Context2 -> Context3
      ctx1.add(entity2);
      ctx2.add(entity3);

      // Update tree at top most entity.
      system.updateTree(world, entity1);

      expect(element1).toMatchObject({
        step1: true,
        step2: false,
        step3: false
      });

      expect(element2).toMatchObject({
        step1: false,
        step2: true,
        step3: false
      });

      expect(element3).toMatchObject({
        step1: false,
        step2: false,
        step3: true
      });
    });
  });

});

