import { BehaviorNode, NodeState } from './behavior-node';


/**
 * Decorators visit their child node and modifies its result. Each decorator can only
 * have a single child. An example for a decorator would be the {@link Succeeder}, which
 * always returns a success state regardless of the actual state produced by the child.
 */
export abstract class Decorator<D> implements BehaviorNode<D> {

  /**
   * @param child Node that will be visited by the decorator.
   */
  constructor(public readonly child: BehaviorNode<D>) {}

  /** @inheritDoc */
  public abstract visit(data: D): NodeState;

}
