/** State that is returned when visiting a {@link BehaviorNode}. */
export enum NodeState {
  /** Node behavior has finished as intended. */
  Success,
  /** Node behavior has finished but did not run as intended. */
  Failure,
  /** Node behavior is still executing. */
  Running
}

/**
 * Behavior nodes define small behaviors for non-player controlled entities. Multiple,
 * nested behavior nodes are called a behavior tree.
 *
 * There are four common types of behavior nodes:
 *
 * -  Action:
 *      A node that does something. For example, an action that is done by an NPC such
 *      as eating, sleeping, etc.
 * -  Condition:
 *      Checks if a condition for the next node is being met. This is usually used in
 *      combination with composite nodes to do sanity checks for action nodes that come
 *      afterward.
 * -  {@link Composite}:
 *      Composite nodes contain child nodes and instructions how and when they are being
 *      visited. For example, a {@link Sequence} is a composite node that visits all of
 *      its children from left to right.
 * -  {@link Decorator}:
 *      Decorators visit their child node and modifies its result. Each decorator can only
 *      have a single child. An example for a decorator would be the {@link Succeeder},
 *      which always returns a success state regardless of the actual state produced by
 *      the child.
 *
 * - `D`: Custom data passed through the behavior tree.
 */
export interface BehaviorNode<D> {

  /** Implementation of the nodes visit logic. */
  visit(data: D): NodeState;

  /** Implementation of the nodes reset logic. */
  reset?(data: D): void;

}

/**
 * Visits the given `node` and returns its {@link NodeState}. If the node is not
 * running, the node will be reset.
 */
export function visit<D>(node: BehaviorNode<D>, data: D): NodeState {
  const state = node.visit(data);

  if (state !== NodeState.Running) {
    node.reset?.(data)
  }

  return state;
}

