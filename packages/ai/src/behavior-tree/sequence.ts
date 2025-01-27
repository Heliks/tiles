import { NodeState, visit } from './behavior-node';
import { Composite } from './composite';


/**
 * Composite node that visits each of its children in order, from left to right. If a
 * child returns a success state, the sequence moves on to the next. If a child returns
 * failure state, the entire sequence stops and returns a failure state. The sequence
 * returns a success state if all of its children were successful.
 */
export class Sequence<D> extends Composite<D> {

  /**
   * Contains the index of the last child node that returned a {@link NodeState.Running}
   * state. The node will be visited by the sequence until it returns any other state,
   * skipping other child nodes that would otherwise be visited before that node.
   *
   * @internal
   */
  private running = 0;

  /** @inheritDoc */
  public visit(data: D): NodeState {
    const start = this.running;

    this.running = 0;

    for (let i = start, l = this.children.length; i < l; i++) {
      const result = visit(this.children[i], data);

      if (result === NodeState.Success) {
        continue;
      }

      if (result === NodeState.Running) {
        this.running = i;
      }

      return result;
    }

    return NodeState.Success;
  }

  /** @inheritDoc */
  public reset(data: D): void {
    if (this.running > -1) {
      this.children[ this.running ].reset?.(data);
      this.running = 0;
    }
  }

}
