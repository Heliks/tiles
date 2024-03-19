import { BehaviorNode, NodeState } from '../behavior-node';


export class NoopNode<D = unknown> implements BehaviorNode<D> {

  /** @inheritDoc */
  public visit = jest.fn().mockReturnValue(NodeState.Success);

}
