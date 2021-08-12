import { EventQueue } from '@heliks/tiles-engine';

/**
 * Component that when attached to an entity that has a `SpriteDisplay` component, will
 * forward interaction events (a.E. mouse down, mouse up and click) to appropriate
 * event queues that can be subscribed to.
 */
export class SpriteEvent {

  /**
   * Event channel that contains mouse down events on desktop devices, and touchstart
   * events on mobile devices.
   */
  public down = new EventQueue();

  /**
   * Event channel that contains mouse up events on desktop devices, and touchend
   * events on mobile devices.
   */
  public up = new EventQueue();

}





