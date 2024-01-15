import { App, Parent, runtime, TransformBundle, World } from '@heliks/tiles-engine';
import { Element } from '../../element';
import { UiNode } from '../../ui-node';
import { UpdateElements } from '../update-elements';


class NoopElement implements Element {

  /** @inheritDoc */
  update = jest.fn();

  /** @inheritDoc */
  public getContextInstance(): this {
    return this;
  }

}

describe('UpdateNodes', () => {
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
    // The order of parent components is different from the order in which the entities
    // are created on purpose to make sure this test does not report a false positive
    // where entities were merely conviniently located next to each other in their group.
    const entity1 = world.insert(new UiNode());
    const entity2 = world.insert(new UiNode());
    const entity3 = world.insert(new UiNode());

    world.attach(entity2, new Parent(entity1));
    world.attach(entity1, new Parent(entity3));

    const onUpdateNode = jest.spyOn(system, 'updateNode');

    app.update();

    expect(onUpdateNode).toHaveBeenNthCalledWith(1, world, entity3);
    expect(onUpdateNode).toHaveBeenNthCalledWith(2, world, entity1);
    expect(onUpdateNode).toHaveBeenNthCalledWith(3, world, entity2);
  });
});