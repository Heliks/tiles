export enum SpriteEvents {
  /** No event currently occurs on the sprite. */
  None,
  Down,
  Up
}

/**
 * Component that tracks browser events (mouse down, mouse up, etc.) on entities that
 * render a {@link SpriteRender sprite}.
 */
export class SpriteEvent {

  /** The active sprite event. */
  public active = SpriteEvents.None;

  /**
   * Events that occurred on the sprite that await processing by the event system.
   * @internal
   */
  public readonly _queue: SpriteEvents[] = [];

}





