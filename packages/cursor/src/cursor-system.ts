import { Injectable, System, Vec2 } from '@heliks/tiles-engine';
import { Camera, Renderer } from '@heliks/tiles-pixi';
import { Cursor, CursorButton } from './cursor';


/** @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button */
const enum MouseButton {
  Primary = 0,
  Auxiliary = 1,
  Secondary = 2,
}

@Injectable()
export class CursorSystem implements System {

  /** Contains unprocessed pressed buttons. */
  private readonly down = new Set<CursorButton>();

  /** Contains unprocessed released buttons. */
  private readonly up = new Set<CursorButton>();

  /** Contains the last known screen position. */
  private readonly screen = new Vec2();

  constructor(
    private readonly camera: Camera,
    private readonly cursor: Cursor,
    private readonly renderer: Renderer
  ) {}

  /** Converts a {@link MouseButton} into a {@link CursorButton}. */
  public getCursorButton(button: MouseButton): CursorButton {
    switch (button) {
      default:
      case MouseButton.Primary:
        return CursorButton.Primary;
      case MouseButton.Secondary:
        return CursorButton.Secondary;
      case MouseButton.Auxiliary:
        return CursorButton.Auxiliary;
    }
  }

  /**
   * Updates the cursors' last known screen position. This causes the world position to
   * be recalculated on the next game tick.
   */
  public setScreenPosition(x: number, y: number): void {
    if (this.screen.x !== x || this.screen.y !== y) {
      this.screen.set(x, y);
    }
  }

  /** @internal */
  private onMouseMove(event: MouseEvent): void {
    console.log('move')
    this.screen.set(event.offsetX, event.offsetY);
  }

  /** @internal */
  private onMouseDown(event: MouseEvent): void {
    this.screen.set(event.offsetX, event.offsetY);
    this.down.add(this.getCursorButton(event.button));
  }

  /** @internal */
  private onMouseUp(event: MouseEvent): void {
    this.screen.set(event.offsetX, event.offsetY);
    this.up.add(this.getCursorButton(event.button));
  }

  /** @inheritDoc */
  public boot(): void {
    const element = this.renderer.element();

    element.addEventListener('mousemove', this.onMouseMove.bind(this));
    element.addEventListener('mousedown', this.onMouseDown.bind(this));
    element.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  /** @inheritDoc */
  public update(): void {
    this.cursor.downNow.clear();
    this.cursor.up.clear();

    for (const button of this.down) {
      this.cursor.downNow.add(button);
      this.cursor.down.add(button);
    }

    for (const button of this.up) {
      this.cursor.up.add(button);
      this.cursor.down.delete(button);
    }

    this.down.clear();
    this.up.clear();

    this.cursor.screen.set(this.screen.x, this.screen.y);
    this.camera.screenToWorld(this.screen.x, this.screen.y, this.cursor.world);
  }

}
