import { NodeState, visit } from './behavior-node';
import { Composite } from './composite';


/**
 * The selector {@link Composite} visits each of its children from left to right. If a
 * child returns a success state, the selector will also return a success. If a child
 * fails, the selector will move onto the next child. In case all children fail, the
 * selector fails as well.
 */
export class Selector<D> extends Composite<D> {

  /**
   * Index of the last child that returned a {@link NodeState.Running}. This node is
   * visited until it either fails or succeeds, skipping children that would otherwise
   * be visited first.
   */
  private running = 0;

  /** @inheritDoc */
  public visit(data: D): NodeState {
    const start = this.running;

    this.running = 0;

    for (let i = start, l = this.children.length; i < l; i++) {
      const result = visit(this.children[i], data);

      if (result === NodeState.Success) {
        return result;
      }

      if (result === NodeState.Running) {
        this.running = i;

        return result;
      }
    }

    return NodeState.Failure;
  }

  /** @inheritDoc */
  public reset(data: D): void {
    if (this.running > -1) {
      this.children[ this.running ].reset?.(data);
      this.running = 0;
    }
  }

}
