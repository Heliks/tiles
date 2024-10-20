/**
 * A state that can be returned by a {@link BehaviorNode} visit.
 */
export enum NodeState {
  /** Node behavior is finished as intended. */
  Success,
  /** Node behavior is finished but did not run as intended. */
  Failure,
  /** Node is still executing. */
  Running
}

/**
 * Interface for a behavior tree node. Nodes are the core of behavior trees. In fact,
 * a behavior tree is just a group of nodes. There are four common node categories:
 *
 * -  Action: A node that does something. For example, an action that is done by an NPC
 *    such as eating, sleeping, etc.
 * -  Condition: Checks if a condition for the next node is being met. This is usually
 *    used in combination with composite nodes to do sanity checks for action nodes that
 *    come afterwards.
 * -  Composite: See {@link Composite}
 * -  Decorator: See {@link Decorator}
 *
 * - `D`: Custom data passed through the behavior tree.
 */
export interface BehaviorNode<D> {

  visit(data: D): NodeState;

  /**
   * Implementation for the reset logic of this node, if any. Nodes are reset every time
   * they return a state that is not {@link NodeState.Success}.
   */
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

