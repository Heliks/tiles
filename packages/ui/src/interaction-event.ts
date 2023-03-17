import { Entity } from "@heliks/tiles-engine";


/** Possible interactions with {@link UiNode ui nodes}. */
export enum Interaction {
  /** User is not currently not interacting with this node. */
  None,
  /** Node is pressed down (e.g. mouse down, touch down) */
  Down,
  /** Node was released this frame (e.g. mouse up, touch up). */
  Up
}

/**
 * Event that is fired when the {@link UiNode.interaction interaction} changes. Events
 * are propagated through event queues of parent nodes (event bubbling).
 */
export class InteractionEvent {

  /**
   * @param target The entity that initially triggered the event.
   * @param interaction New interaction.
   */
  constructor(
    public readonly target: Entity,
    public readonly interaction: Interaction
  ) {}

}
