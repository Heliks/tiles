import { Entity } from '@heliks/tiles-engine';
import { UiNodeInteraction } from './ui-node';


/**
 * Event that is fired when the {@link UiNode.interaction interaction} changes. Events
 * are propagated through event queues of parent nodes (event bubbling).
 */
export class UiEvent {

  /**
   * @param target The entity that initially triggered the event.
   * @param interaction New interaction.
   */
  constructor(public readonly target: Entity, public readonly interaction: UiNodeInteraction) {}

  /**
   * Returns `true` if this event was fired because a {@link UiNodeInteraction.Down down}
   * interaction has started.
   */
  public isDown(): boolean {
    return this.interaction === UiNodeInteraction.Down;
  }

  /**
   * Returns `true` if this event was fired because a {@link UiNodeInteraction.Up up}
   * interaction has started.
   */
  public isUp(): boolean {
    return this.interaction === UiNodeInteraction.Up;
  }

}
