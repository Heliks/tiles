import { BehaviorNode, NodeState } from './behavior-node';


/**
 * Composite nodes contain child nodes and instructions how and when they are being
 * visited. For example, a {@link Sequence} is a composite node that visits all of
 * its children from left to right.
 */
export abstract class Composite<D> implements BehaviorNode<D> {

  /** @inheritDoc */
  public children: BehaviorNode<D>[] = [];

  /** @inheritDoc */
  public abstract visit(data: D): NodeState;

  /** Adds the given `node` as a child. */
  public add(node: BehaviorNode<D>): this {
    this.children.push(node);

    return this;
  }

}
