import { App, Parent, runtime, TransformBundle, World } from '@heliks/tiles-engine';
import { UiNode } from '../../ui-node';
import { UiWidget } from '../../ui-widget';
import { UpdateWidgets } from '../update-widgets';


class NoopElement implements UiWidget {

  /** @inheritDoc */
  update = jest.fn();

  /** @inheritDoc */
  public getContextInstance(): this {
    return this;
  }

}

describe('UpdateNodes', () => {
  let app: App;
  let system: UpdateWidgets;
  let world: World;

  beforeEach(() => {
    app = runtime()
      .component(UiNode)
      .component(Parent)
      .bundle(new TransformBundle())
      .system(UpdateWidgets)
      .build();

    // Boot system.
    app.start({
      update: jest.fn()
    });

    system = app.world.get(UpdateWidgets);
    world = app.world;
  });

  it('should update node widget', () => {
    const widget = new NoopElement();
    const entity = world.insert(new UiNode().setWidget(widget));

    system.updateNode(world, entity);

    expect(widget.update).toHaveBeenCalled();
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