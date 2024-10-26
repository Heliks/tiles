import { Entity } from '@heliks/tiles-engine';
import { UiNodeInteraction } from './ui-node';


/**
 * Events are triggered by user actions on interactive {@link UiNode nodes} e.g. clicking
 * the pointer (this is either the mouse button or a tap, depending on the device).
 *
 * Events are (bubbled)[https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles]
 * up through a nodes parent tree.
 */
export class UiEvent {

  /**
   * @param target Owner of the node on which the event was triggered.
   * @param interaction Action that was triggered.
   */
  constructor(public readonly target: Entity, public readonly interaction: UiNodeInteraction) {}

  /** Returns `true` if the event {@link interaction} is {@link UiNodeInteraction.Down}. */
  public isDown(): boolean {
    return this.interaction === UiNodeInteraction.Down;
  }

  /** Returns `true` if the event {@link interaction} is {@link UiNodeInteraction.Up}. */
  public isUp(): boolean {
    return this.interaction === UiNodeInteraction.Up;
  }

}
