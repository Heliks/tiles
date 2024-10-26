import { BehaviorNode, NodeState } from './behavior-node';


/**
 * Composite nodes are a type of {@link BehaviorNode} that contains child nodes and
 * instructions on how to visit each of them. For example, a {@link Sequence} is a
 * composite node that visits all of its children in order from left to right.
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
