import { EventQueue } from '@heliks/tiles-engine';

/**
 * Component that when attached to an entity that has a `SpriteDisplay` component, will
 * start to listen to events concerning that sprite (e.g. mouse up or mouse down) and
 * forward them to one of the appropriate event queues of this component.
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





