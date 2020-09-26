import { Stage } from '../stage';
import { Container } from '../renderables';

describe('Stage', () => {
  let stage: Stage;

  beforeEach(() => {
    stage = new Stage();
  });

  it('should add renderables', () => {
    const item = new Container();

    stage.add(item);

    const length = stage.view.children.length;

    expect(length).toBe(1);
  });

  it('should add renderables as child of a node', () => {
    const node = stage.createNode();
    const item = new Container();

    stage.add(item, node);

    const length = stage.getNodeContainer(node).children.length;

    expect(length).toBe(1);
  });

  it('should remove renderables', () => {
    const item = new Container();

    stage.add(item).remove(item);

    expect(stage.view.children.length).toBe(0);
  });

  it('should remove renderables that are part of a node', () => {
    const node = stage.createNode();
    const item = new Container();

    stage.add(item, node).remove(item);

    const length = stage.getNodeContainer(node).children.length;

    expect(length).toBe(0);
  });

  it('should create a node', () => {
    const node = stage.createNode();

    expect(typeof node).toBe('symbol');
  });

  it('should destroy a node', () => {
    const node = stage.createNode();

    stage.destroyNode(node);

    expect(stage.view.children.length).toBe(0);
  });
});
