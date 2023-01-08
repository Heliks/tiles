import { Sequence } from '../sequence';
import { NoopNode } from './noop-node';
import { NodeState } from '../behavior-node';


describe('Sequence', () => {
  let node: Sequence<symbol>;
  let data: symbol;

  let childA: NoopNode;
  let childB: NoopNode;
  let childC: NoopNode;

  beforeEach(() => {
    node = new Sequence();
    data = Symbol();

    childA = new NoopNode();
    childB = new NoopNode();
    childC = new NoopNode();

    node.children.push(
      childA,
      childB,
      childC
    );
  });

  describe('when all children are successful', () => {
    it('should return success state', () => {
      expect(node.visit(data)).toBe(NodeState.Success);
    });

    it('should visit all children', () => {
      node.visit(data);

      expect(childA.visit).toHaveBeenCalled();
      expect(childB.visit).toHaveBeenCalled();
      expect(childC.visit).toHaveBeenCalled();
    });
  })

  describe('when a child fails', () => {
    beforeEach(() => {
      // Force childB to fail.
      childB.visit = jest.fn().mockReturnValue(NodeState.Failure);
    });

    it('should return fail state', () => {
      expect(node.visit(data)).toBe(NodeState.Failure);
    });

    it('should not visit subsequent children', () => {
      node.visit(data);

      expect(childC.visit).not.toHaveBeenCalled();
    });
  });

  describe('when a child is running', () => {
    beforeEach(() => {
      childB.visit = jest.fn().mockReturnValue(NodeState.Running);
    });

    it('should return running state', () => {
      expect(node.visit(data)).toBe(NodeState.Running);
    });

    it('should not visit subsequent children', () => {
      node.visit(data);

      expect(childC.visit).not.toHaveBeenCalled();
    });

    it('should run child until it is no longer running', () => {
      // This should call childA.visit 1x and childB.visit 2x, because childB is
      // running and therefore visited until it no longer runs.
      node.visit(data);
      node.visit(data);

      childB.visit.mockReturnValue(NodeState.Success);

      // On the second visit, the first child should be visited again.
      node.visit(data);
      node.visit(data);

      expect(childA.visit).toHaveBeenCalledTimes(2);
      expect(childB.visit).toHaveBeenCalledTimes(4);
    });
  });
});
