import { BehaviorNode, NodeState } from './behavior-node';


/**
 * Decorator nodes are a type of node that has exactly one node as a child of which it
 * modifies the {@link NodeState} of. Usually this is done to invert a success state
 * to a failure state or vice versa.
 */
export abstract class Decorator<D> implements BehaviorNode<D> {

  /**
   * @param child Node that will be visited by the decorator.
   */
  constructor(public readonly child: BehaviorNode<D>) {}

  /** @inheritDoc */
  public abstract visit(data: D): NodeState;

}
