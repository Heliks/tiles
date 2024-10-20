import { EventQueue, Vec2 } from '@heliks/tiles-engine';


/**
 * Possible events that can be triggered by a {@link Screen}.
 */
export enum ScreenEvent {
  Resize
}

/**
 * Describes the dimensions of the "Screen" for graphical applications. In traditional
 * game engines, this is usually called the "Window".
 *
 * There are two sizes associated with a screen. The requested size (resolution) and the
 * absolute amount of pixels on the monitor (size).
 */
export class Screen {

  /**
   * Event queue that reacts to changes to the screen.
   *
   * @see ScreenEvent
   */
  public readonly events = new EventQueue<ScreenEvent>();

  /**
   * Contains the scaling factor. This multiplied with {@link resolution} is the actual
   * pixel size of the screen. Do not update this manually.
   */
  public readonly scale = new Vec2(1, 1);

  /**
   * Contains the actual pixel size that results from the screen {@link resolution}
   * and {@link scale} factor. Do not update this manually.
   */
  public readonly size: Vec2;

  /**
   * @param resolution Contains the requested width and height of the screen. The actual
   *  amount of rendered pixels may differ from this value, as the renderer canvas can
   *  be resized and scaled independently of resolution.
   */
  constructor(public readonly resolution: Vec2) {
    this.size = resolution.clone();
  }

  /**
   * Resizes the screen to the given `width` and height`. The {@link resolution} is
   * retained by updating the screen {@link scale} factor.
   */
  public resize(width: number, height: number): this {
    this.size.x = width;
    this.size.y = height;

    this.scale.x = width / this.resolution.x;
    this.scale.y = height / this.resolution.y;

    this.events.push(ScreenEvent.Resize);

    return this;
  }

}
