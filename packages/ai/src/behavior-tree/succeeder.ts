import { NodeState, visit } from './behavior-node';
import { Decorator } from './decorator';


/**
 * Decorator node that will always return {@link NodeState.Success}, or if the node
 * is currently running, a {@link NodeState.Running}. This is useful for cases where
 * a failure is expected, but we don't want to stop processing a composite node like
 * a sequence.
 */
export class Succeeder<D> extends Decorator<D> {

  /** @internal */
  public visit(data: D): NodeState {
    return visit(this.child, data) === NodeState.Running ? NodeState.Running : NodeState.Success;
  }

}
