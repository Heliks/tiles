import { NoopNode } from './noop-node';
import { Succeeder } from '../succeeder';
import { NodeState } from '../behavior-node';


describe('Succeeder', () => {
  let node: Succeeder<Symbol>;
  let data: symbol;

  beforeEach(() => {
    node = new Succeeder(new NoopNode());
    data = Symbol();
  });

  it('should return success state if child returns success', () => {
    node.child.visit = jest.fn().mockReturnValue(NodeState.Success);

    const result = node.visit(data);

    expect(result).toBe(NodeState.Success);
  });

  it('should return success state if child returns failure', () => {
    node.child.visit = jest.fn().mockReturnValue(NodeState.Failure);

    const result = node.visit(data);

    expect(result).toBe(NodeState.Success);
  });

  it('should return running state if child returns failure', () => {
    node.child.visit = jest.fn().mockReturnValue(NodeState.Running);

    const result = node.visit(data);

    expect(result).toBe(NodeState.Running);
  });
});
