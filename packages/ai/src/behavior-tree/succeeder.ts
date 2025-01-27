import { NodeState, visit } from './behavior-node';
import { Decorator } from './decorator';


/**
 * A decorator that will always return a success state regardless of what result the
 * child of this decorator actually returned. This is useful in cases where a failure
 * is expected, like continuing to process a {@link Composite}.
 */
export class Succeeder<D> extends Decorator<D> {

  /** @internal */
  public visit(data: D): NodeState {
    return visit(this.child, data) === NodeState.Running ? NodeState.Running : NodeState.Success;
  }

}
