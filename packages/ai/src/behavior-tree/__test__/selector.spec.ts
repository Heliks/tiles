import { NodeState } from '../behavior-node';
import { Selector } from '../selector';
import { NoopNode } from './noop-node';


describe('Selector', () => {
  let node: Selector<symbol>;
  let data: symbol;

  beforeEach(() => {
    node = new Selector();
    data = Symbol();
  });

  it('should succeed when any child is successful', () => {
    const child0 = new NoopNode();
    const child1 = new NoopNode();

    child0.visit.mockReturnValue(NodeState.Failure)
    child1.visit.mockReturnValue(NodeState.Success)

    node.children.push(child0, child1);

    expect(node.visit(data)).toBe(NodeState.Success);
  });

  it('should fail when all children fail', () => {
    const child0 = new NoopNode();
    const child1 = new NoopNode();

    child0.visit.mockReturnValue(NodeState.Failure);
    child1.visit.mockReturnValue(NodeState.Failure);

    node.children.push(child0, child1);

    expect(node.visit(data)).toBe(NodeState.Failure);
  });

  it('should visit children from left to right until one succeeds', () => {
    const child0 = new NoopNode();
    const child1 = new NoopNode();
    const child2 = new NoopNode();

    child0.visit.mockReturnValue(NodeState.Failure);
    child1.visit.mockReturnValue(NodeState.Success);
    child2.visit.mockReturnValue(NodeState.Failure);

    node.children.push(
      child0,
      child1,
      child2
    );

    node.visit(data);

    expect(child0.visit).toHaveBeenCalled();
    expect(child1.visit).toHaveBeenCalled();
    expect(child2.visit).not.toHaveBeenCalled();
  });

  describe('when a child is running', () => {
    let child0: NoopNode;
    let child1: NoopNode;
    let child2: NoopNode;

    beforeEach(() => {
      child0 = new NoopNode();
      child1 = new NoopNode();
      child2 = new NoopNode();

      node.children.push(
        child0,
        child1,
        child2
      );

      child0.visit.mockReturnValue(NodeState.Failure);
      child1.visit.mockReturnValue(NodeState.Running);
    });

    it('should return running state', () => {
      expect(node.visit(data)).toBe(NodeState.Running);
    });

    it('should not visit subsequent children', () => {
      node.visit(data);

      expect(child2.visit).not.toHaveBeenCalled();
    });

    it('should run child until it is no longer running', () => {
      // This should call childA.visit 1x and childB.visit 2x, because childB is
      // running and therefore visited until it no longer runs.
      node.visit(data);
      node.visit(data);

      child1.visit.mockReturnValue(NodeState.Success);

      // On the second visit, the first child should be visited again.
      node.visit(data);
      node.visit(data);

      expect(child0.visit).toHaveBeenCalledTimes(2);
      expect(child1.visit).toHaveBeenCalledTimes(4);
    });
  });
});
